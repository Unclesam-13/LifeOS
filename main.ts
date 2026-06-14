import {
  App,
  ButtonComponent,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  requestUrl,
  Setting,
  TFile,
  normalizePath
} from "obsidian";

interface LifeOSSettings {
  databaseFolder: string;
  quickRecordCategories: string[];
  homePreviewPanels: string[];
  aiApiUrl: string;
  aiApiKey: string;
  aiModel: string;
  aiSystemPrompt: string;
}

interface LifeOSTask {
  file: TFile;
  line: number;
  text: string;
  completed: boolean;
}

interface LifeOSItem {
  file: TFile;
  title: string;
  status: string;
  progress: number | null;
}

interface VocabularyCard {
  file: TFile;
  line: number;
  word: string;
  meaning: string;
  example: string;
  completed: boolean;
}

type LifeOSPanel =
  | "home"
  | "today"
  | "task"
  | "quick"
  | "goal"
  | "project"
  | "learning"
  | "learningNote"
  | "english"
  | "health"
  | "healthSleep"
  | "healthExercise"
  | "healthDiet"
  | "healthEnergy"
  | "healthWeight"
  | "finance"
  | "relationship"
  | "review"
  | "database"
  | "previewDetail"
  | "previewSettings"
  | "evolution";

const DEFAULT_SETTINGS: LifeOSSettings = {
  databaseFolder: "LifeOS",
  quickRecordCategories: ["想法", "记账", "学习", "情绪", "灵感", "其他"],
  homePreviewPanels: ["tasks", "goals", "projects", "learning", "relationships"],
  aiApiUrl: "https://api.deepseek.com",
  aiApiKey: "",
  aiModel: "deepseek-chat",
  aiSystemPrompt: "你是 LifeOS 的内置 AI 助手。你帮助用户理解和改进 LifeOS 人生管理系统。你可以提出建议，也可以通过 lifeos-write 代码块请求插件写入 LifeOS 数据库文件夹。禁止写入 LifeOS 文件夹之外的路径。"
};

const DATABASE_FOLDERS = [
  "00_首页",
  "01_每日记录",
  "02_目标管理",
  "03_任务与项目",
  "04_学习系统",
  "05_健康管理",
  "06_财务管理",
  "07_人际关系",
  "08_职业发展",
  "09_情绪与自我觉察",
  "10_知识库",
  "11_复盘总结",
  "12_模板",
  "99_归档"
];

export default class LifeOSPlugin extends Plugin {
  settings: LifeOSSettings;
  modal: LifeOSModal | null = null;

  async onload() {
    await this.loadSettings();
    await this.ensureDatabase();

    this.addRibbonIcon("layout-dashboard", "Open LifeOS", () => {
      void this.openLifeOS();
    });

    this.addCommand({
      id: "open-lifeos-panel",
      name: "Open LifeOS floating panel",
      callback: () => void this.openLifeOS()
    });

    this.addCommand({
      id: "create-today-note",
      name: "Create today's LifeOS note",
      callback: () => void this.ensureTodayNote().then(() => new Notice("Today's LifeOS note is ready."))
    });

    this.addSettingTab(new LifeOSSettingTab(this.app, this));
  }

  onunload() {
    this.modal?.close();
  }

  async openLifeOS() {
    await this.ensureDatabase();

    if (this.modal) {
      this.modal.close();
    }

    this.modal = new LifeOSModal(this.app, this);
    this.modal.open();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!Array.isArray(this.settings.quickRecordCategories)) {
      this.settings.quickRecordCategories = [...DEFAULT_SETTINGS.quickRecordCategories];
    }
    if (!Array.isArray(this.settings.homePreviewPanels)) {
      this.settings.homePreviewPanels = [...DEFAULT_SETTINGS.homePreviewPanels];
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async ensureDatabase() {
    const root = this.databasePath();
    await this.ensureFolder(root);

    for (const folder of DATABASE_FOLDERS) {
      await this.ensureFolder(this.databasePath(folder));
    }

    await this.ensureFile(
      this.databasePath("system.config.md"),
      this.createSystemConfig()
    );
    await this.ensureFile(
      this.databasePath("00_首页", "人生仪表盘.md"),
      "# 人生仪表盘\n\n这个文件由 LifeOS 插件创建。可视化面板会优先从 LifeOS 数据库文件夹读取和写入数据。\n"
    );
    await this.ensureFile(
      this.getEvolutionPath(),
      this.createEvolutionContent()
    );
    await this.ensureFile(
      this.getAiLogPath(),
      this.createAiLogContent()
    );
    await this.ensureFile(
      this.databasePath("12_模板", "每日记录模板.md"),
      this.createDailyNoteContent(this.today())
    );
    await this.ensureFile(
      this.getAIWriteGuidePath(),
      this.createAIWriteGuideContent()
    );
    await this.ensureModuleTemplates();
    await this.ensureFolder(this.databasePath("04_学习系统", "英语"));
    await this.ensureFile(
      this.getVocabularyPath(),
      this.createVocabularyContent()
    );
    await this.ensureFile(
      this.databasePath("03_任务与项目", "项目清单.md"),
      "---\ntype: project_index\nstatus: 进行中\n---\n\n# 项目清单\n\n## 任务清单\n\n- [ ] 搭建 LifeOS 第一版面板 #task #project\n"
    );
    await this.ensureFile(
      this.databasePath("02_目标管理", `${new Date().getFullYear()}年度目标.md`),
      `---\ntype: goal\ntitle: ${new Date().getFullYear()}年度目标\nstatus: 进行中\nprogress: 0\npriority: P1\n---\n\n# ${new Date().getFullYear()}年度目标\n\n## 目标清单\n\n- [ ] 写下今年最重要的三个目标 #task #goal\n`
    );
  }

  databasePath(...parts: string[]) {
    return normalizePath([this.settings.databaseFolder, ...parts].join("/"));
  }

  async ensureFolder(path: string) {
    const normalized = normalizePath(path);
    if (!this.app.vault.getAbstractFileByPath(normalized)) {
      await this.app.vault.createFolder(normalized);
    }
  }

  async ensureFile(path: string, content: string) {
    const normalized = normalizePath(path);
    if (!this.app.vault.getAbstractFileByPath(normalized)) {
      await this.app.vault.create(normalized, content);
    }
  }

  today() {
    return window.moment().format("YYYY-MM-DD");
  }

  getTodayPath() {
    return this.databasePath("01_每日记录", `${this.today()}.md`);
  }

  getEvolutionPath() {
    return this.databasePath("00_首页", "系统自我进化.md");
  }

  getAiLogPath() {
    return this.databasePath("00_首页", "AI问答记录.md");
  }

  getVocabularyPath() {
    return this.databasePath("04_学习系统", "英语", "单词闪卡.md");
  }

  getAIWriteGuidePath() {
    return this.databasePath("12_模板", "AI写入规范.md");
  }

  createSystemConfig() {
    return `---\ntype: system_config\nversion: ${this.manifest.version}\ndatabase_name: ${this.settings.databaseFolder}\ncreated_at: ${this.today()}\nschema_version: 1\n---\n\n# LifeOS 系统配置\n\n这个文件由插件维护，用于记录人生管理系统的数据库版本、文件夹结构和字段规范。\n`;
  }

  createDailyNoteContent(date: string) {
    return `---\ntype: daily\ndate: ${date}\nmood: \nenergy: \nsleep: \nexercise: false\n---\n\n# ${date}\n\n## 今日重点\n\n- [ ] \n\n## 快速记录\n\n\n## 学习记录\n\n\n## 健康记录\n\n- 睡眠：\n- 运动：\n- 饮食：\n- 精力评分：/10\n\n## 情绪记录\n\n- 今日情绪：\n- 触发原因：\n- 我如何回应：\n\n## 消费记录\n\n\n## 今日复盘\n\n- 做得好的：\n- 可以改进的：\n- 明天最重要的一件事：\n`;
  }

  createEvolutionContent() {
    return `---\ntype: system_evolution\nversion: ${this.manifest.version}\ncreated_at: ${this.today()}\nupdated_at: ${this.today()}\nfor_external_ai: true\n---\n\n# 系统自我进化\n\n## 给外部 AI 的简化说明\n\nLifeOS 是一个 Obsidian 插件。它的目标是把 Obsidian 变成一个低学习成本的人生管理系统：Markdown 文件作为数据库，悬浮可视化面板作为操作界面。用户尽量不直接编辑 Markdown，而是在面板里填写、点击、勾选和创建内容。插件默认只读写当前 Obsidian 仓库中的 LifeOS 数据库文件夹，不主动修改其他笔记。\n\n外部 AI 修改这个系统时，应该优先理解用户真实想要的使用体验，然后再修改插件代码、Markdown 数据结构或面板交互。修改应保持一个原则：让用户更少接触复杂语法，让系统更贴合用户自己的生活管理方式。\n\n## 原始状态\n\n- 系统从一个 Markdown 规划文件开始。\n- 第一版要求是基于 Obsidian 管理生活和学习。\n- 后续确定插件形式：安装后在当前仓库根目录创建独立 LifeOS 数据库文件夹。\n- 再后续确定交互形式：悬浮面板、主面板、子面板、返回按钮、关闭按钮、放大按钮。\n- 当前方向是：所有主要填写动作都通过面板完成，并把内容写入 LifeOS 文件夹下的 Markdown。\n\n## 自适应进化过程\n\n- 2026-06-09：创建 LifeOS 插件骨架，支持独立数据库文件夹。\n- 2026-06-09：改为悬浮面板，加入主面板和子面板导航。\n- 2026-06-09：扩展今日、任务、快速记录、目标、项目、学习、健康、财务、人际、复盘和数据库模块。\n- 2026-06-09：加入系统自我进化功能，专门为外部 AI 提供系统背景、演化记录和用户未来方向。\n\n## 当前系统边界\n\n- 默认数据库文件夹：LifeOS/\n- 插件安装目录通常是：.obsidian/plugins/lifeos/\n- 外部 AI 如果要修改插件，应优先查看插件目录中的 main.ts、styles.css、manifest.json。\n- 外部 AI 如果要理解用户需求，应优先读取本文件。\n- 不要默认移动、删除或覆盖用户原有 Obsidian 笔记。\n- 如需迁移旧笔记，应采用复制转换方式写入 LifeOS 数据库文件夹。\n\n## 用户提出的进化方向\n\n\n## 外部 AI 修改建议格式\n\n外部 AI 每次修改前，建议先整理以下内容：\n\n1. 用户这次真正想解决的问题。\n2. 当前系统中最接近这个需求的模块。\n3. 需要新增或修改的面板。\n4. 需要新增或修改的 Markdown 数据格式。\n5. 修改后如何验证。\n\n## 已完成修改记录\n\n`;
  }

  createVocabularyContent() {
    return `---\ntype: vocabulary_flashcards\nsubject: 英语\nupdated_at: ${this.today()}\nformat: "- [ ] word :: meaning :: example"\n---\n\n# 英语单词闪卡\n\n## 单词列表\n\n- [ ] example :: 例子；示例 :: This is an example sentence.\n`;
  }

  createAiLogContent() {
    return `---\ntype: ai_chat_log\ncreated_at: ${this.today()}\nupdated_at: ${this.today()}\n---\n\n# AI 问答记录\n\n`;
  }

  createAIWriteGuideContent() {
    return `---\ntype: ai_write_guide\nupdated_at: ${this.today()}\nfor_external_ai: true\n---\n\n# LifeOS AI 写入规范\n\n## 核心原则\n\nAI 修改 LifeOS 数据时，必须优先按照本文件选择写入位置和格式。不要把所有内容都写进每日记录。每日记录只用于当天流水、快速记录、偶发健康/财务片段；结构化内容应该写入对应模块文件夹。\n\n所有写入必须位于 LifeOS/ 数据库文件夹内。不要移动、删除或覆盖用户原有 Obsidian 笔记。\n\n## 模块写入位置\n\n| 用户意图 | 写入位置 | 推荐格式 |\n| --- | --- | --- |\n| 新增任务 | LifeOS/03_任务与项目/项目清单.md 或具体项目文件 | Markdown task |\n| 新增目标 | LifeOS/02_目标管理/目标名称.md | goal frontmatter |\n| 新增项目 | LifeOS/03_任务与项目/项目名称.md | project frontmatter |\n| 学习笔记 | LifeOS/04_学习系统/主题.md | learning_note frontmatter |\n| 英语单词 | LifeOS/04_学习系统/英语/单词闪卡.md | - [ ] word :: meaning :: example |\n| 健康记录 | LifeOS/05_健康管理/健康记录.md | timestamp category value note |\n| 财务记录 | LifeOS/06_财务管理/财务记录.md | timestamp category amount account note |\n| 联系人 | LifeOS/07_人际关系/姓名.md | relationship frontmatter |\n| 复盘 | LifeOS/11_复盘总结/YYYY-MM-DD-类型复盘.md | review frontmatter |\n| 今日临时流水 | LifeOS/01_每日记录/YYYY-MM-DD.md | daily note section |\n\n## 受控写入格式\n\n如果需要让插件直接写入文件，使用：\n\n\`\`\`lifeos-write\npath: LifeOS/模块路径/文件名.md\nmode: append\ncontent:\n要写入的 Markdown 内容\n\`\`\`\n\nmode 可用 append 或 overwrite。除非用户明确要求重写文件，否则使用 append。\n\n## 模板索引\n\n- 任务模板：LifeOS/12_模板/AI模板-任务.md\n- 目标模板：LifeOS/12_模板/AI模板-目标.md\n- 项目模板：LifeOS/12_模板/AI模板-项目.md\n- 学习模板：LifeOS/12_模板/AI模板-学习.md\n- 英语单词模板：LifeOS/12_模板/AI模板-英语单词.md\n- 健康模板：LifeOS/12_模板/AI模板-健康.md\n- 财务模板：LifeOS/12_模板/AI模板-财务.md\n- 人际模板：LifeOS/12_模板/AI模板-人际.md\n- 复盘模板：LifeOS/12_模板/AI模板-复盘.md\n`;
  }

  async ensureModuleTemplates() {
    const templates: Record<string, string> = {
      "AI模板-任务.md": "# AI 模板 - 任务\n\n写入位置：`LifeOS/03_任务与项目/项目清单.md` 或具体项目文件。\n\n格式：\n\n```markdown\n- [ ] 任务内容 #task\n```\n\n示例：\n\n```markdown\n- [ ] 解决 8 个模型的参数问题 #task\n```\n",
      "AI模板-目标.md": "# AI 模板 - 目标\n\n写入位置：`LifeOS/02_目标管理/目标名称.md`\n\n```markdown\n---\ntype: goal\ntitle: 目标名称\nstatus: 进行中\narea: \ndeadline: YYYY-MM-DD\nprogress: 0\npriority: P2\n---\n\n# 目标名称\n\n## 为什么重要\n\n\n## 成功标准\n\n\n## 下一步行动\n\n- [ ] \n```\n",
      "AI模板-项目.md": "# AI 模板 - 项目\n\n写入位置：`LifeOS/03_任务与项目/项目名称.md`\n\n```markdown\n---\ntype: project\ntitle: 项目名称\nstatus: 进行中\narea: \ndeadline: YYYY-MM-DD\nprogress: 0\n---\n\n# 项目名称\n\n## 项目目标\n\n\n## 任务清单\n\n- [ ] \n\n## 进度记录\n\n\n## 项目复盘\n\n```\n",
      "AI模板-学习.md": "# AI 模板 - 学习\n\n写入位置：`LifeOS/04_学习系统/主题.md`\n\n```markdown\n---\ntype: learning_note\ntitle: 主题\nstatus: 进行中\nsource: \ncreated: YYYY-MM-DD\nreview_count: 0\n---\n\n# 主题\n\n## 来源\n\n\n## 核心内容\n\n\n## 我的理解\n\n\n## 可应用场景\n\n\n## 下一步\n\n- [ ] \n```\n",
      "AI模板-英语单词.md": "# AI 模板 - 英语单词\n\n写入位置：`LifeOS/04_学习系统/英语/单词闪卡.md`\n\n只追加到 `## 单词列表` 下方。\n\n```markdown\n- [ ] word :: 中文释义 :: English example sentence.\n```\n",
      "AI模板-健康.md": "# AI 模板 - 健康\n\n优先写入位置：`LifeOS/05_健康管理/健康记录.md`\n\n```markdown\n## YYYY-MM-DD\n\n- YYYY-MM-DD HH:mm | 睡眠/运动/饮食/精力/体重 | 记录内容 | 备注\n```\n\n如果用户明确说是今日流水，也可以写入当天每日记录的 `## 健康记录`。\n",
      "AI模板-财务.md": "# AI 模板 - 财务\n\n优先写入位置：`LifeOS/06_财务管理/财务记录.md`\n\n```markdown\n## YYYY-MM-DD\n\n- YYYY-MM-DD HH:mm | 分类 | 金额 | 账户 | 必要性 | 备注\n```\n\n如果用户明确说是今日流水，也可以写入当天每日记录的 `## 消费记录`。\n",
      "AI模板-人际.md": "# AI 模板 - 人际\n\n写入位置：`LifeOS/07_人际关系/姓名.md`\n\n```markdown\n---\ntype: relationship\nname: 姓名\nrelation: \nbirthday: \ncity: \nlast_contact: YYYY-MM-DD\n---\n\n# 姓名\n\n## 基本信息\n\n- 关系：\n- 生日：\n- 城市：\n\n## 重要信息\n\n- 喜欢：\n\n## 最近互动\n\n- YYYY-MM-DD \n\n## 可以关心的事\n\n- [ ] \n```\n",
      "AI模板-复盘.md": "# AI 模板 - 复盘\n\n写入位置：`LifeOS/11_复盘总结/YYYY-MM-DD-类型复盘.md`\n\n```markdown\n---\ntype: review\nscope: daily/weekly/monthly\ndate: YYYY-MM-DD\n---\n\n# YYYY-MM-DD 复盘\n\n## 高光\n\n\n## 问题\n\n\n## 下一步\n\n- [ ] \n```\n"
    };

    for (const [name, content] of Object.entries(templates)) {
      await this.ensureFile(this.databasePath("12_模板", name), content);
    }
  }

  async ensureTodayNote() {
    const path = this.getTodayPath();
    const existing = this.app.vault.getAbstractFileByPath(path);

    if (existing instanceof TFile) {
      return existing;
    }

    await this.app.vault.create(path, this.createDailyNoteContent(this.today()));
    const created = this.app.vault.getAbstractFileByPath(path);
    if (!(created instanceof TFile)) {
      throw new Error("Failed to create today's LifeOS note.");
    }

    return created;
  }

  async updateTodayFields(fields: Record<string, string>) {
    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    await this.app.vault.modify(file, updateFrontmatter(content, fields));
  }

  async addTodayTask(text: string) {
    const task = text.trim();
    if (!task) {
      new Notice("任务不能为空。");
      return;
    }

    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    const next = appendToSection(content, "今日重点", `- [ ] ${task}`);
    await this.app.vault.modify(file, next);
  }

  async addQuickNote(text: string, category = "其他") {
    const note = text.trim();
    if (!note) {
      new Notice("记录不能为空。");
      return;
    }

    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    const time = window.moment().format("YYYY-MM-DD HH:mm");
    const next = appendToSection(content, "快速记录", `- ${time} | ${category.trim() || "其他"} | ${note}`);
    await this.app.vault.modify(file, next);
  }

  async addQuickRecordCategory(category: string) {
    const value = category.trim();
    if (!value) {
      new Notice("分类不能为空。");
      return;
    }

    if (!this.settings.quickRecordCategories.includes(value)) {
      this.settings.quickRecordCategories.push(value);
      await this.saveSettings();
    }
  }

  async addDailyReview(text: string) {
    const review = text.trim();
    if (!review) {
      return;
    }

    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    const next = appendToSection(content, "今日复盘", `- ${review}`);
    await this.app.vault.modify(file, next);
  }

  async createGoal(input: { title: string; why: string; deadline: string; progress: string; priority: string }) {
    const title = input.title.trim();
    if (!title) {
      new Notice("目标名称不能为空。");
      return;
    }

    const path = this.databasePath("02_目标管理", `${sanitizeFileName(title)}.md`);
    const content = `---\ntype: goal\ntitle: ${title}\nstatus: 进行中\narea: \ndeadline: ${input.deadline.trim()}\nprogress: ${input.progress.trim() || "0"}\npriority: ${input.priority.trim() || "P2"}\n---\n\n# ${title}\n\n## 为什么重要\n\n${input.why.trim()}\n\n## 成功标准\n\n\n## 下一步行动\n\n- [ ] \n`;
    await this.ensureFile(path, content);
  }

  async createProject(input: { title: string; target: string; deadline: string; progress: string }) {
    const title = input.title.trim();
    if (!title) {
      new Notice("项目名称不能为空。");
      return;
    }

    const path = this.databasePath("03_任务与项目", `${sanitizeFileName(title)}.md`);
    const content = `---\ntype: project\ntitle: ${title}\nstatus: 进行中\narea: \ndeadline: ${input.deadline.trim()}\nprogress: ${input.progress.trim() || "0"}\n---\n\n# ${title}\n\n## 项目目标\n\n${input.target.trim()}\n\n## 任务清单\n\n- [ ] \n\n## 进度记录\n\n\n## 项目复盘\n\n`;
    await this.ensureFile(path, content);
  }

  async createLearningNote(input: { title: string; source: string; summary: string; next: string }) {
    const title = input.title.trim();
    if (!title) {
      new Notice("学习主题不能为空。");
      return;
    }

    const path = this.databasePath("04_学习系统", `${sanitizeFileName(title)}.md`);
    const content = `---\ntype: learning_note\ntitle: ${title}\nstatus: 进行中\nsource: ${input.source.trim()}\ncreated: ${this.today()}\nreview_count: 0\n---\n\n# ${title}\n\n## 来源\n\n${input.source.trim()}\n\n## 核心内容\n\n${input.summary.trim()}\n\n## 我的理解\n\n\n## 可应用场景\n\n\n## 下一步\n\n- [ ] ${input.next.trim()}\n`;
    await this.ensureFile(path, content);
  }

  async addHealthRecord(input: { sleep: string; exercise: string; diet: string; energy: string; weight: string; note: string }) {
    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    const next = appendToSection(
      updateFrontmatter(content, {
        sleep: input.sleep.trim(),
        exercise: input.exercise.trim(),
        energy: input.energy.trim(),
        weight: input.weight.trim()
      }),
      "健康记录",
      `- 睡眠：${input.sleep.trim() || "未记录"}；运动：${input.exercise.trim() || "未记录"}；饮食：${input.diet.trim() || "未记录"}；体重：${input.weight.trim() || "未记录"}；备注：${input.note.trim() || "无"}`
    );
    await this.app.vault.modify(file, next);
  }

  async addHealthCategoryRecord(category: string, value: string, note: string) {
    const record = value.trim();
    if (!record) {
      new Notice("记录内容不能为空。");
      return;
    }

    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    const time = window.moment().format("YYYY-MM-DD HH:mm");
    const line = `- ${time} | ${category} | ${record} | ${note.trim() || "无备注"}`;
    const next = appendToSection(content, "健康记录", line);
    await this.app.vault.modify(file, next);
    await this.appendModuleRecord("05_健康管理", "健康记录.md", "健康记录", line);
  }

  async addFinanceRecord(input: { amount: string; category: string; account: string; necessity: string; note: string }) {
    const file = await this.ensureTodayNote();
    const content = await this.app.vault.read(file);
    const time = window.moment().format("YYYY-MM-DD HH:mm");
    const line = `- ${time} | ${input.category.trim() || "未分类"} | ${input.amount.trim() || "0"} | ${input.account.trim() || "未记录"} | 必要性：${input.necessity.trim() || "未记录"} | ${input.note.trim()}`;
    const next = appendToSection(
      content,
      "消费记录",
      line
    );
    await this.app.vault.modify(file, next);
    await this.appendModuleRecord("06_财务管理", "财务记录.md", "财务记录", line);
  }

  async appendModuleRecord(folder: string, fileName: string, title: string, line: string) {
    const path = this.databasePath(folder, fileName);
    await this.ensureFile(path, `---\ntype: module_record\ntitle: ${title}\nupdated_at: ${this.today()}\n---\n\n# ${title}\n\n`);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
      return;
    }

    const content = await this.app.vault.read(file);
    const day = this.today();
    const withFrontmatter = updateFrontmatter(content, { updated_at: day });
    const next = appendToSection(withFrontmatter, day, line);
    await this.app.vault.modify(file, next);
  }

  async createRelationship(input: { name: string; relation: string; birthday: string; city: string; likes: string; nextAction: string }) {
    const name = input.name.trim();
    if (!name) {
      new Notice("联系人姓名不能为空。");
      return;
    }

    const path = this.databasePath("07_人际关系", `${sanitizeFileName(name)}.md`);
    const content = `---\ntype: relationship\nname: ${name}\nrelation: ${input.relation.trim()}\nbirthday: ${input.birthday.trim()}\ncity: ${input.city.trim()}\nlast_contact: ${this.today()}\n---\n\n# ${name}\n\n## 基本信息\n\n- 关系：${input.relation.trim()}\n- 生日：${input.birthday.trim()}\n- 城市：${input.city.trim()}\n\n## 重要信息\n\n- 喜欢：${input.likes.trim()}\n\n## 最近互动\n\n- ${this.today()} 创建联系人记录\n\n## 可以关心的事\n\n- [ ] ${input.nextAction.trim()}\n`;
    await this.ensureFile(path, content);
  }

  async createReview(input: { scope: string; highlights: string; problems: string; next: string }) {
    const scope = input.scope.trim() || "daily";
    const folder = scope === "weekly" || scope === "monthly" ? "11_复盘总结" : "01_每日记录";
    const title = `${this.today()}-${scope}-review`;
    const path = this.databasePath(folder, `${sanitizeFileName(title)}.md`);
    const content = `---\ntype: review\nscope: ${scope}\ndate: ${this.today()}\n---\n\n# ${this.today()} 复盘\n\n## 高光\n\n${input.highlights.trim()}\n\n## 问题\n\n${input.problems.trim()}\n\n## 下一步\n\n- [ ] ${input.next.trim()}\n`;
    await this.ensureFile(path, content);
  }

  async addEvolutionRequest(input: { direction: string; context: string; expected: string }) {
    const direction = input.direction.trim();
    if (!direction) {
      new Notice("进化方向不能为空。");
      return;
    }

    await this.ensureFile(this.getEvolutionPath(), this.createEvolutionContent());
    const file = this.app.vault.getAbstractFileByPath(this.getEvolutionPath());
    if (!(file instanceof TFile)) {
      throw new Error("Failed to find system evolution file.");
    }

    const content = await this.app.vault.read(file);
    const time = window.moment().format("YYYY-MM-DD HH:mm");
    const entry = `### ${time}\n\n- 进化方向：${direction}\n- 使用背景：${input.context.trim() || "未填写"}\n- 理想效果：${input.expected.trim() || "未填写"}\n`;
    const next = appendToSection(updateFrontmatter(content, { updated_at: this.today() }), "用户提出的进化方向", entry);
    await this.app.vault.modify(file, next);
  }

  async addEvolutionIssue(issue: string) {
    const value = issue.trim();
    if (!value) {
      new Notice("改进问题不能为空。");
      return;
    }

    await this.ensureFile(this.getEvolutionPath(), this.createEvolutionContent());
    const file = this.app.vault.getAbstractFileByPath(this.getEvolutionPath());
    if (!(file instanceof TFile)) {
      throw new Error("Failed to find system evolution file.");
    }

    const content = await this.app.vault.read(file);
    const time = window.moment().format("YYYY-MM-DD HH:mm");
    const entry = `### ${time}\n\n- 改进问题：${value}\n`;
    const next = appendToSection(updateFrontmatter(content, { updated_at: this.today() }), "用户提出的进化方向", entry);
    await this.app.vault.modify(file, next);
  }

  async askAI(question: string) {
    const value = question.trim();
    if (!value) {
      new Notice("AI 问题不能为空。");
      return "";
    }

    if (!this.settings.aiApiKey.trim()) {
      new Notice("请先在 LifeOS 设置里填写 AI API Key。");
      return "";
    }

    const context = await this.buildAIContext();
    const response = await requestUrl({
      url: `${this.settings.aiApiUrl.replace(/\/$/, "")}/v1/chat/completions`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.settings.aiApiKey}`
      },
      body: JSON.stringify({
        model: this.settings.aiModel,
        messages: [
          {
            role: "system",
            content: `${this.settings.aiSystemPrompt}\n\n你必须优先遵守 LifeOS/12_模板/AI写入规范.md。用户要求记录内容时，先判断所属模块，再写到对应模块文件夹，不要默认写进每日记录。\n\n如果你需要修改文档，请只使用如下格式：\n\n\`\`\`lifeos-write\npath: LifeOS/相对路径.md\nmode: append\ncontent:\n要写入的 Markdown 内容\n\`\`\`\n\nmode 只能是 append 或 overwrite。path 必须在 LifeOS 数据库文件夹内。`
          },
          {
            role: "user",
            content: `LifeOS 当前上下文：\n\n${context}\n\n用户问题：\n${value}`
          }
        ],
        temperature: 0.3
      })
    });

    const text = response.json?.choices?.[0]?.message?.content ?? "";
    const writes = await this.applyAIWriteBlocks(text);
    await this.appendAiLog(value, text, writes);
    return text;
  }

  async buildAIContext() {
    const filesToRead = [
      this.getAIWriteGuidePath(),
      this.getEvolutionPath(),
      this.getTodayPath(),
      this.databasePath("00_首页", "人生仪表盘.md"),
      this.databasePath("03_任务与项目", "项目清单.md"),
      this.getVocabularyPath()
    ];
    const chunks: string[] = [];

    for (const path of filesToRead) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        const content = await this.app.vault.cachedRead(file);
        chunks.push(`--- FILE: ${path} ---\n${content.slice(0, 4000)}`);
      }
    }

    const stats = this.getDatabaseFiles()
      .slice(0, 80)
      .map((file) => `- ${file.path}`)
      .join("\n");
    chunks.push(`--- LIFEOS FILE INDEX ---\n${stats}`);
    return chunks.join("\n\n").slice(0, 16000);
  }

  async applyAIWriteBlocks(answer: string) {
    const results: string[] = [];
    const regex = /```lifeos-write\s*\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(answer)) !== null) {
      const block = match[1];
      const parsed = parseAIWriteBlock(block);
      if (!parsed) {
        results.push("跳过：写入块格式无效");
        continue;
      }

      const normalizedPath = normalizePath(parsed.path);
      const root = this.databasePath();
      if (!normalizedPath.startsWith(`${root}/`)) {
        results.push(`拒绝：${normalizedPath} 不在 ${root}/ 内`);
        continue;
      }

      await this.ensureParentFolder(normalizedPath);
      const existing = this.app.vault.getAbstractFileByPath(normalizedPath);
      if (existing instanceof TFile) {
        if (parsed.mode === "overwrite") {
          await this.app.vault.modify(existing, parsed.content);
        } else {
          const current = await this.app.vault.read(existing);
          await this.app.vault.modify(existing, `${current.trimEnd()}\n\n${parsed.content.trim()}\n`);
        }
      } else {
        await this.app.vault.create(normalizedPath, `${parsed.content.trim()}\n`);
      }

      results.push(`已写入：${normalizedPath} (${parsed.mode})`);
    }

    return results;
  }

  async ensureParentFolder(path: string) {
    const parts = normalizePath(path).split("/");
    parts.pop();
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      await this.ensureFolder(current);
    }
  }

  async appendAiLog(question: string, answer: string, writes: string[]) {
    await this.ensureFile(this.getAiLogPath(), this.createAiLogContent());
    const file = this.app.vault.getAbstractFileByPath(this.getAiLogPath());
    if (!(file instanceof TFile)) {
      return;
    }

    const content = await this.app.vault.read(file);
    const time = window.moment().format("YYYY-MM-DD HH:mm");
    const entry = `## ${time}\n\n### 用户\n\n${question.trim()}\n\n### AI\n\n${answer.trim() || "无回答"}\n\n### 写入结果\n\n${writes.length ? writes.map((item) => `- ${item}`).join("\n") : "- 无文档写入"}\n`;
    await this.app.vault.modify(file, `${content.trimEnd()}\n\n${entry}`);
  }

  getDatabaseFiles() {
    const root = this.databasePath();
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path === root || file.path.startsWith(`${root}/`));
  }

  async getOpenTasks(limit = 12): Promise<LifeOSTask[]> {
    const tasks: LifeOSTask[] = [];

    for (const file of this.getDatabaseFiles()) {
      const content = await this.app.vault.cachedRead(file);
      if (this.shouldSkipTaskScan(file, content)) {
        continue;
      }

      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const match = line.match(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/);
        if (!match) {
          return;
        }

        const completed = match[1].toLowerCase() === "x";
        if (!completed && match[2].trim()) {
          tasks.push({ file, line: index, text: match[2], completed });
        }
      });
    }

    return tasks.slice(0, limit);
  }

  async getCompletedTasks(limit = 12): Promise<LifeOSTask[]> {
    const tasks: LifeOSTask[] = [];

    for (const file of this.getDatabaseFiles()) {
      const content = await this.app.vault.cachedRead(file);
      if (this.shouldSkipTaskScan(file, content)) {
        continue;
      }

      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const match = line.match(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/);
        if (!match) {
          return;
        }

        const completed = match[1].toLowerCase() === "x";
        if (completed && match[2].trim()) {
          tasks.push({ file, line: index, text: match[2], completed });
        }
      });
    }

    return tasks.slice(0, limit);
  }

  shouldSkipTaskScan(file: TFile, content: string) {
    const frontmatter = parseFrontmatter(content);
    const skippedTypes = new Set([
      "vocabulary_flashcards",
      "ai_chat_log",
      "system_evolution",
      "system_config"
    ]);

    if (skippedTypes.has(frontmatter.type)) {
      return true;
    }

    const skippedPaths = new Set([
      this.getVocabularyPath(),
      this.getAiLogPath(),
      this.getEvolutionPath(),
      this.databasePath("system.config.md")
    ]);

    return skippedPaths.has(file.path);
  }

  async toggleTask(task: LifeOSTask) {
    const content = await this.app.vault.read(task.file);
    const lines = content.split("\n");
    const line = lines[task.line];

    if (!line) {
      new Notice("没有找到这条任务。");
      return;
    }

    lines[task.line] = line.replace(/-\s+\[[ xX]\]/, task.completed ? "- [ ]" : "- [x]");
    await this.app.vault.modify(task.file, lines.join("\n"));
  }

  async getItems(folder: string, type: string, limit = 6): Promise<LifeOSItem[]> {
    const prefix = this.databasePath(folder);
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(`${prefix}/`));
    const items: LifeOSItem[] = [];

    for (const file of files) {
      const content = await this.app.vault.cachedRead(file);
      const frontmatter = parseFrontmatter(content);

      if (frontmatter.type && frontmatter.type !== type && type !== "any") {
        continue;
      }

      const status = frontmatter.status ?? "未设置";
      if (status === "已完成" || status === "归档") {
        continue;
      }

      items.push({
        file,
        title: frontmatter.title ?? file.basename,
        status,
        progress: parseNumber(frontmatter.progress)
      });
    }

    return items.slice(0, limit);
  }

  async addVocabularyCard(input: { word: string; meaning: string; example: string }) {
    const word = input.word.trim();
    const meaning = input.meaning.trim();
    if (!word || !meaning) {
      new Notice("单词和释义不能为空。");
      return;
    }

    await this.ensureFolder(this.databasePath("04_学习系统", "英语"));
    await this.ensureFile(this.getVocabularyPath(), this.createVocabularyContent());
    const file = this.app.vault.getAbstractFileByPath(this.getVocabularyPath());
    if (!(file instanceof TFile)) {
      throw new Error("Failed to find vocabulary file.");
    }

    const content = await this.app.vault.read(file);
    const next = appendToSection(
      updateFrontmatter(content, { updated_at: this.today() }),
      "单词列表",
      `- [ ] ${word} :: ${meaning} :: ${input.example.trim()}`
    );
    await this.app.vault.modify(file, next);
  }

  async getVocabularyCards(limit = 20): Promise<VocabularyCard[]> {
    await this.ensureFolder(this.databasePath("04_学习系统", "英语"));
    await this.ensureFile(this.getVocabularyPath(), this.createVocabularyContent());
    const file = this.app.vault.getAbstractFileByPath(this.getVocabularyPath());
    if (!(file instanceof TFile)) {
      return [];
    }

    const content = await this.app.vault.cachedRead(file);
    const cards: VocabularyCard[] = [];
    content.split("\n").forEach((line, index) => {
      const match = line.match(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*::\s*(.*?)\s*(?:::|$)\s*(.*?)\s*$/);
      if (!match) {
        return;
      }

      cards.push({
        file,
        line: index,
        word: match[2].trim(),
        meaning: match[3].trim(),
        example: match[4].trim(),
        completed: match[1].toLowerCase() === "x"
      });
    });

    return cards.slice(0, limit);
  }
}

class LifeOSModal extends Modal {
  plugin: LifeOSPlugin;
  panel: LifeOSPanel = "home";
  panelHistory: LifeOSPanel[] = [];
  expanded = false;
  evolutionDraft = "";
  aiDraft = "";
  aiAnswerText = "";
  aiAnswerVisible = false;
  previewTarget = "tasks";

  constructor(app: App, plugin: LifeOSPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    this.modalEl.addClass("lifeos-floating-modal");
    this.render();
  }

  onClose() {
    this.plugin.modal = null;
    this.contentEl.empty();
  }

  async render() {
    this.contentEl.empty();
    this.modalEl.toggleClass("lifeos-expanded", this.expanded);

    const shell = this.contentEl.createDiv({ cls: "lifeos-shell" });
    this.renderHeader(shell);

    const layout = shell.createDiv({ cls: "lifeos-content-layout" });
    const body = layout.createDiv({ cls: "lifeos-body" });
    this.renderEvolutionSidebar(layout);

    if (this.panel === "home") {
      await this.renderHome(body);
    } else if (this.panel === "today") {
      await this.renderTodayForm(body);
    } else if (this.panel === "task") {
      await this.renderTaskPanel(body);
    } else if (this.panel === "quick") {
      this.renderQuickPanel(body);
    } else if (this.panel === "goal") {
      this.renderGoalPanel(body);
    } else if (this.panel === "project") {
      this.renderProjectPanel(body);
    } else if (this.panel === "learning") {
      this.renderLearningPanel(body);
    } else if (this.panel === "learningNote") {
      this.renderLearningNotePanel(body);
    } else if (this.panel === "english") {
      await this.renderEnglishPanel(body);
    } else if (this.panel === "health") {
      this.renderHealthPanel(body);
    } else if (this.panel === "healthSleep") {
      this.renderHealthCategoryPanel(body, "睡眠", "例如：7.5小时，23:30入睡，07:00醒来");
    } else if (this.panel === "healthExercise") {
      this.renderHealthCategoryPanel(body, "运动", "例如：跑步30分钟，力量训练45分钟");
    } else if (this.panel === "healthDiet") {
      this.renderHealthCategoryPanel(body, "饮食", "例如：早餐正常，晚餐偏油，喝水较少");
    } else if (this.panel === "healthEnergy") {
      this.renderHealthCategoryPanel(body, "精力", "例如：7/10，下午明显犯困");
    } else if (this.panel === "healthWeight") {
      this.renderHealthCategoryPanel(body, "体重", "例如：68.5kg");
    } else if (this.panel === "finance") {
      this.renderFinancePanel(body);
    } else if (this.panel === "relationship") {
      this.renderRelationshipPanel(body);
    } else if (this.panel === "review") {
      this.renderReviewPanel(body);
    } else if (this.panel === "database") {
      this.renderDatabasePanel(body);
    } else if (this.panel === "previewDetail") {
      await this.renderPreviewDetailPanel(body);
    } else if (this.panel === "previewSettings") {
      this.renderPreviewSettingsPanel(body);
    } else if (this.panel === "evolution") {
      this.renderEvolutionPanel(body);
    }
  }

  renderEvolutionSidebar(parent: HTMLElement) {
    const sidebar = parent.createDiv({ cls: "lifeos-evolution-sidebar" });
    sidebar.createEl("h3", { text: "系统进化" });
    sidebar.createEl("p", {
      text: "随时记录这个面板哪里不好用、想新增什么、希望外部 AI 怎么继续改。",
      cls: "lifeos-sidebar-desc"
    });

    const input = sidebar.createEl("textarea", {
      cls: "lifeos-evolution-input",
      placeholder: "输入需要改进的问题..."
    });
    input.value = this.evolutionDraft;
    input.addEventListener("input", () => {
      this.evolutionDraft = input.value;
    });

    const actions = sidebar.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(actions)
      .setButtonText("保存")
      .setCta()
      .onClick(async () => {
        await this.plugin.addEvolutionIssue(input.value);
        input.value = "";
        this.evolutionDraft = "";
        new Notice("改进问题已写入系统自我进化文件。");
      });

    new ButtonComponent(actions)
      .setButtonText("说明")
      .onClick(() => {
        this.navigate("evolution");
        void this.render();
      });

    const aiSection = sidebar.createDiv({ cls: "lifeos-ai-section" });
    aiSection.createDiv({ cls: "lifeos-sidebar-divider" });
    aiSection.createEl("h3", { text: "AI 问答" });
    aiSection.createEl("p", {
      text: "AI 会读取 LifeOS 上下文。若回答包含受控写入块，插件会只在 LifeOS 文件夹内修改 Markdown。",
      cls: "lifeos-sidebar-desc"
    });

    const aiInput = aiSection.createEl("textarea", {
      cls: "lifeos-ai-input",
      placeholder: "问 AI，或让它修改 LifeOS 文档..."
    });
    aiInput.value = this.aiDraft;
    aiInput.addEventListener("input", () => {
      this.aiDraft = aiInput.value;
    });

    const aiActions = aiSection.createDiv({ cls: "lifeos-actions lifeos-ai-actions" });
    const aiAnswer = aiSection.createDiv({ cls: "lifeos-ai-answer" });
    if (this.aiAnswerVisible) {
      aiAnswer.show();
      aiAnswer.setText(this.aiAnswerText);
    } else {
      aiAnswer.hide();
    }

    new ButtonComponent(aiActions)
      .setButtonText("发送")
      .setCta()
      .onClick(async () => {
        this.aiAnswerVisible = true;
        this.aiAnswerText = "正在思考...";
        aiAnswer.show();
        aiAnswer.setText(this.aiAnswerText);
        try {
          const answer = await this.plugin.askAI(aiInput.value);
          this.aiAnswerText = answer || "没有收到回答。";
          aiAnswer.setText(this.aiAnswerText);
          aiInput.value = "";
          this.aiDraft = "";
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.aiAnswerText = `请求失败：${message}`;
          aiAnswer.setText(this.aiAnswerText);
          new Notice("AI 请求失败，请检查 API 设置。");
        }
      });

    new ButtonComponent(aiActions)
      .setButtonText("记录")
      .onClick(async () => {
        const logFile = this.plugin.app.vault.getAbstractFileByPath(this.plugin.getAiLogPath());
        if (logFile instanceof TFile) {
          this.close();
          await this.plugin.app.workspace.getLeaf(true).openFile(logFile);
        }
      });
  }

  renderHeader(parent: HTMLElement) {
    const header = parent.createDiv({ cls: "lifeos-panel-header" });
    const left = header.createDiv({ cls: "lifeos-panel-left" });

    if (this.panel !== "home") {
      new ButtonComponent(left)
        .setIcon("arrow-left")
        .setTooltip("返回上一级")
        .onClick(() => {
          this.goBack();
          void this.render();
        });
    }

    left.createEl("h2", { text: this.getTitle(), cls: "lifeos-panel-title" });

    const right = header.createDiv({ cls: "lifeos-panel-actions" });
    new ButtonComponent(right)
      .setIcon(this.expanded ? "minimize-2" : "maximize-2")
      .setTooltip(this.expanded ? "缩小面板" : "扩大面板")
      .onClick(() => {
        this.expanded = !this.expanded;
        void this.render();
      });
    new ButtonComponent(right)
      .setButtonText("×")
      .setTooltip("关闭")
      .onClick(() => this.close());
  }

  navigate(panel: LifeOSPanel) {
    if (panel !== this.panel) {
      this.panelHistory.push(this.panel);
      this.panel = panel;
    }
  }

  goBack() {
    this.panel = this.panelHistory.pop() ?? "home";
  }

  getTitle() {
    const titles: Record<LifeOSPanel, string> = {
      home: "LifeOS",
      today: "今日填写",
      task: "任务面板",
      quick: "快速记录",
      goal: "新建目标",
      project: "新建项目",
      learning: "学习记录",
      learningNote: "通用学习笔记",
      english: "英语学习",
      health: "健康记录",
      healthSleep: "睡眠记录",
      healthExercise: "运动记录",
      healthDiet: "饮食记录",
      healthEnergy: "精力记录",
      healthWeight: "体重记录",
      finance: "财务记录",
      relationship: "人际关系",
      review: "复盘",
      database: "数据库",
      previewDetail: "预览",
      previewSettings: "预览设置",
      evolution: "系统进化"
    };
    return titles[this.panel];
  }

  async renderHome(parent: HTMLElement) {
    parent.createEl("p", {
      text: `${this.plugin.today()} · 数据库：${this.plugin.settings.databaseFolder}`,
      cls: "lifeos-subtitle"
    });

    const nav = parent.createDiv({ cls: "lifeos-nav-grid" });
    this.addNavButton(nav, "今日填写", "填写情绪、精力、睡眠和复盘", "today");
    this.addNavButton(nav, "任务", "添加任务，勾选完成", "task");
    this.addNavButton(nav, "快速记录", "捕捉想法、学习、消费和灵感", "quick");
    this.addNavButton(nav, "目标", "创建一个新的目标文件", "goal");
    this.addNavButton(nav, "项目", "创建一个新的项目文件", "project");
    this.addNavButton(nav, "学习", "选择学科和学习方式", "learning");
    this.addNavButton(nav, "健康", "按类型记录身体状态", "health");
    this.addNavButton(nav, "财务", "记录消费、分类和必要性", "finance");
    this.addNavButton(nav, "人际", "创建联系人和维护提醒", "relationship");
    this.addNavButton(nav, "复盘", "创建每日、每周或每月复盘", "review");
    this.addNavButton(nav, "数据库", "查看系统边界和文件统计", "database");
    this.addNavButton(nav, "预览设置", "增减主面板下方的预览卡片", "previewSettings");
    this.addNavButton(nav, "系统进化", "给外部 AI 看的需求和演化记录", "evolution");

    const grid = parent.createDiv({ cls: "lifeos-grid" });
    await this.renderHomePreviews(grid);
  }

  addNavButton(parent: HTMLElement, title: string, desc: string, panel: LifeOSPanel) {
    const button = parent.createEl("button", { cls: "lifeos-nav-button" });
    button.createSpan({ text: title, cls: "lifeos-nav-title" });
    button.createSpan({ text: desc, cls: "lifeos-nav-desc" });
    button.addEventListener("click", () => {
      this.navigate(panel);
      void this.render();
    });
  }

  async renderHomePreviews(parent: HTMLElement) {
    const selected = new Set(this.plugin.settings.homePreviewPanels);
    const configs: Array<{ id: string; render: () => Promise<void> }> = [
      { id: "tasks", render: () => this.renderTasksPreview(parent) },
      { id: "goals", render: () => this.renderItemsPreview(parent, "目标", "02_目标管理", "goal", "goals") },
      { id: "projects", render: () => this.renderItemsPreview(parent, "项目", "03_任务与项目", "any", "projects") },
      { id: "learning", render: () => this.renderItemsPreview(parent, "学习", "04_学习系统", "learning_note", "learning") },
      { id: "relationships", render: () => this.renderItemsPreview(parent, "人际", "07_人际关系", "relationship", "relationships") },
      { id: "health", render: async () => this.renderSimplePreview(parent, "健康", "查看已记录的睡眠、运动、饮食、精力、体重", "health") },
      { id: "finance", render: async () => this.renderSimplePreview(parent, "财务", "查看已经记录的消费内容", "finance") },
      { id: "reviews", render: () => this.renderItemsPreview(parent, "复盘", "11_复盘总结", "review", "reviews") }
    ];

    for (const config of configs) {
      if (selected.has(config.id)) {
        await config.render();
      }
    }
  }

  navigatePreview(target: string) {
    this.previewTarget = target;
    this.navigate("previewDetail");
  }

  async renderTodayForm(parent: HTMLElement) {
    const file = await this.plugin.ensureTodayNote();
    const frontmatter = parseFrontmatter(await this.plugin.app.vault.cachedRead(file));

    const mood = this.addInput(parent, "今日情绪", frontmatter.mood ?? "", "例如：平静、有压力、开心");
    const energy = this.addInput(parent, "精力评分", frontmatter.energy ?? "", "0-10");
    const sleep = this.addInput(parent, "睡眠时间", frontmatter.sleep ?? "", "例如：7.5");
    const exercise = this.addInput(parent, "是否运动", frontmatter.exercise ?? "false", "true / false");
    const review = this.addTextarea(parent, "今日复盘", "写几句今天的复盘");

    this.addSubmit(parent, "保存今日填写", async () => {
      await this.plugin.updateTodayFields({
        mood: mood.value,
        energy: energy.value,
        sleep: sleep.value,
        exercise: exercise.value
      });
      await this.plugin.addDailyReview(review.value);
      new Notice("已写入今日记录。");
      this.goBack();
      await this.render();
    });
  }

  async renderTaskPanel(parent: HTMLElement) {
    const input = this.addInput(parent, "新增任务", "", "输入任务内容");
    this.addSubmit(parent, "添加任务", async () => {
      await this.plugin.addTodayTask(input.value);
      input.value = "";
      await this.render();
    });

    parent.createEl("h3", { text: "未完成任务" });
    const openTasks = await this.plugin.getOpenTasks(30);
    const list = parent.createEl("ul", { cls: "lifeos-card-list" });
    if (openTasks.length === 0) {
      list.createEl("li", { text: "没有未完成任务。", cls: "lifeos-empty" });
    }

    for (const task of openTasks) {
      const item = list.createEl("li", { cls: "lifeos-task" });
      const checkbox = item.createEl("input", { type: "checkbox" });
      checkbox.addEventListener("change", async () => {
        await this.plugin.toggleTask(task);
        await this.render();
      });
      item.createSpan({ text: task.text });
    }

    parent.createEl("h3", { text: "已完成任务" });
    const completedTasks = await this.plugin.getCompletedTasks(30);
    const completedList = parent.createEl("ul", { cls: "lifeos-card-list" });
    if (completedTasks.length === 0) {
      completedList.createEl("li", { text: "暂无已完成任务。", cls: "lifeos-empty" });
    }

    for (const task of completedTasks) {
      const item = completedList.createEl("li", { cls: "lifeos-task lifeos-task-completed" });
      const checkbox = item.createEl("input", { type: "checkbox" });
      checkbox.checked = true;
      checkbox.addEventListener("change", async () => {
        await this.plugin.toggleTask(task);
        await this.render();
      });
      item.createSpan({ text: task.text });
    }
  }

  renderQuickPanel(parent: HTMLElement) {
    const categoryWrap = parent.createDiv({ cls: "lifeos-field-wrap" });
    categoryWrap.createEl("label", { text: "记录分类" });
    const category = categoryWrap.createEl("select", { cls: "lifeos-field" });
    for (const item of this.plugin.settings.quickRecordCategories) {
      category.createEl("option", { text: item, value: item });
    }

    const newCategory = this.addInput(parent, "新增分类", "", "例如：灵感、复盘、购物清单");
    const categoryActions = parent.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(categoryActions)
      .setButtonText("添加分类")
      .onClick(async () => {
        await this.plugin.addQuickRecordCategory(newCategory.value);
        new Notice("分类已添加。");
        await this.render();
      });

    const note = this.addTextarea(parent, "快速记录", "写下想法、学习收获、消费、灵感或临时记录");
    this.addSubmit(parent, "写入今日记录", async () => {
      await this.plugin.addQuickNote(note.value, category.value);
      new Notice("已写入今日记录。");
      this.goBack();
      await this.render();
    });
  }

  renderGoalPanel(parent: HTMLElement) {
    const title = this.addInput(parent, "目标名称", "", "例如：提升英语能力");
    const why = this.addTextarea(parent, "为什么重要", "写下这个目标和你的关系");
    const deadline = this.addInput(parent, "截止日期", "", "YYYY-MM-DD");
    const progress = this.addInput(parent, "当前进度", "0", "0-100");
    const priority = this.addInput(parent, "优先级", "P2", "P1 / P2 / P3");

    this.addSubmit(parent, "创建目标", async () => {
      await this.plugin.createGoal({
        title: title.value,
        why: why.value,
        deadline: deadline.value,
        progress: progress.value,
        priority: priority.value
      });
      new Notice("目标已创建。");
      this.goBack();
      await this.render();
    });
  }

  renderProjectPanel(parent: HTMLElement) {
    const title = this.addInput(parent, "项目名称", "", "例如：搭建 LifeOS 插件");
    const target = this.addTextarea(parent, "项目目标", "这个项目完成时应该是什么样子");
    const deadline = this.addInput(parent, "截止日期", "", "YYYY-MM-DD");
    const progress = this.addInput(parent, "当前进度", "0", "0-100");

    this.addSubmit(parent, "创建项目", async () => {
      await this.plugin.createProject({
        title: title.value,
        target: target.value,
        deadline: deadline.value,
        progress: progress.value
      });
      new Notice("项目已创建。");
      this.goBack();
      await this.render();
    });
  }

  renderLearningPanel(parent: HTMLElement) {
    parent.createEl("p", {
      text: "不同学科会有不同学习方式。当前先提供通用学习笔记和英语背单词。",
      cls: "lifeos-subtitle"
    });

    const nav = parent.createDiv({ cls: "lifeos-nav-grid" });
    this.addNavButton(nav, "通用笔记", "课程、读书、文章和知识整理", "learningNote");
    this.addNavButton(nav, "英语", "单词闪卡和英语学习记录", "english");
  }

  renderLearningNotePanel(parent: HTMLElement) {
    const title = this.addInput(parent, "学习主题", "", "例如：深度工作、TypeScript、英语听力");
    const source = this.addInput(parent, "来源", "", "书籍、课程、文章或链接");
    const summary = this.addTextarea(parent, "核心内容", "这次学习最重要的内容是什么");
    const next = this.addInput(parent, "下一步", "", "下一次要做的练习或复习");

    this.addSubmit(parent, "创建学习笔记", async () => {
      await this.plugin.createLearningNote({
        title: title.value,
        source: source.value,
        summary: summary.value,
        next: next.value
      });
      new Notice("学习笔记已创建。");
      this.goBack();
      await this.render();
    });
  }

  async renderEnglishPanel(parent: HTMLElement) {
    parent.createEl("p", {
      text: "单词会保存到 LifeOS/04_学习系统/英语/单词闪卡.md。你也可以让外部 AI 按 “- [ ] word :: meaning :: example” 的格式批量加入。",
      cls: "lifeos-subtitle"
    });

    const word = this.addInput(parent, "单词", "", "example");
    const meaning = this.addInput(parent, "释义", "", "例子；示例");
    const example = this.addTextarea(parent, "例句", "This is an example sentence.");
    this.addSubmit(parent, "加入单词闪卡", async () => {
      await this.plugin.addVocabularyCard({
        word: word.value,
        meaning: meaning.value,
        example: example.value
      });
      new Notice("单词已加入闪卡。");
      await this.render();
    });

    const cards = await this.plugin.getVocabularyCards(30);
    const list = parent.createDiv({ cls: "lifeos-flashcard-grid" });
    for (const card of cards) {
      const item = list.createDiv({ cls: "lifeos-flashcard" });
      item.createEl("strong", { text: card.word });
      item.createEl("p", { text: card.meaning });
      if (card.example) {
        item.createEl("small", { text: card.example });
      }
    }
  }

  renderHealthPanel(parent: HTMLElement) {
    parent.createEl("p", {
      text: "健康不要求每天记录，想起来就按类型记录一次。每条记录都会自动带完整时间。",
      cls: "lifeos-subtitle"
    });

    const nav = parent.createDiv({ cls: "lifeos-nav-grid" });
    this.addNavButton(nav, "睡眠", "记录入睡、起床、时长和质量", "healthSleep");
    this.addNavButton(nav, "运动", "记录运动类型、时长和强度", "healthExercise");
    this.addNavButton(nav, "饮食", "记录饮食状态和特殊摄入", "healthDiet");
    this.addNavButton(nav, "精力", "记录当下精力评分和原因", "healthEnergy");
    this.addNavButton(nav, "体重", "记录体重和身体变化", "healthWeight");
  }

  renderHealthCategoryPanel(parent: HTMLElement, category: string, placeholder: string) {
    const value = this.addInput(parent, `${category}内容`, "", placeholder);
    const note = this.addTextarea(parent, "备注", "可选：补充这次记录的背景或感受");

    this.addSubmit(parent, `保存${category}记录`, async () => {
      await this.plugin.addHealthCategoryRecord(category, value.value, note.value);
      new Notice(`${category}记录已写入今日记录。`);
      this.goBack();
      await this.render();
    });
  }

  renderFinancePanel(parent: HTMLElement) {
    const amount = this.addInput(parent, "金额", "", "例如：35.8");
    const category = this.addInput(parent, "分类", "", "餐饮、交通、学习、娱乐、其他");
    const account = this.addInput(parent, "账户", "", "现金、银行卡、支付宝、微信");
    const necessity = this.addInput(parent, "必要性", "", "必要 / 可选 / 冲动");
    const note = this.addTextarea(parent, "备注", "这笔钱花在哪里，是否值得");

    this.addSubmit(parent, "保存财务记录", async () => {
      await this.plugin.addFinanceRecord({
        amount: amount.value,
        category: category.value,
        account: account.value,
        necessity: necessity.value,
        note: note.value
      });
      new Notice("财务记录已写入今日记录。");
      this.goBack();
      await this.render();
    });
  }

  renderRelationshipPanel(parent: HTMLElement) {
    const name = this.addInput(parent, "姓名", "", "联系人姓名");
    const relation = this.addInput(parent, "关系", "", "朋友、同学、家人、同事");
    const birthday = this.addInput(parent, "生日", "", "YYYY-MM-DD，可选");
    const city = this.addInput(parent, "城市", "", "可选");
    const likes = this.addTextarea(parent, "重要信息", "对方喜欢什么、最近在意什么");
    const nextAction = this.addInput(parent, "下一次关心", "", "例如：周末问候近况");

    this.addSubmit(parent, "创建联系人", async () => {
      await this.plugin.createRelationship({
        name: name.value,
        relation: relation.value,
        birthday: birthday.value,
        city: city.value,
        likes: likes.value,
        nextAction: nextAction.value
      });
      new Notice("联系人已创建。");
      this.goBack();
      await this.render();
    });
  }

  renderReviewPanel(parent: HTMLElement) {
    const scope = this.addInput(parent, "复盘类型", "daily", "daily / weekly / monthly");
    const highlights = this.addTextarea(parent, "高光", "做得好的事、值得保留的经验");
    const problems = this.addTextarea(parent, "问题", "遇到的阻碍、低效和情绪来源");
    const next = this.addInput(parent, "下一步", "", "复盘后最重要的行动");

    this.addSubmit(parent, "创建复盘", async () => {
      await this.plugin.createReview({
        scope: scope.value,
        highlights: highlights.value,
        problems: problems.value,
        next: next.value
      });
      new Notice("复盘已创建。");
      this.goBack();
      await this.render();
    });
  }

  renderDatabasePanel(parent: HTMLElement) {
    const files = this.plugin.getDatabaseFiles();
    parent.createEl("p", {
      text: `LifeOS 默认只读写 ${this.plugin.settings.databaseFolder}/ 文件夹，不主动修改其他笔记。`,
      cls: "lifeos-subtitle"
    });

    const stats = parent.createDiv({ cls: "lifeos-stat-grid" });
    this.addStat(stats, "数据库文件夹", this.plugin.settings.databaseFolder);
    this.addStat(stats, "Markdown 文件", String(files.length));
    this.addStat(stats, "系统模块", String(DATABASE_FOLDERS.length));

    const actions = parent.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(actions)
      .setButtonText("补齐数据库结构")
      .setCta()
      .onClick(async () => {
        await this.plugin.ensureDatabase();
        new Notice("数据库结构已检查并补齐。");
        await this.render();
      });
  }

  renderEvolutionPanel(parent: HTMLElement) {
    const intro = parent.createDiv({ cls: "lifeos-info-box" });
    intro.createEl("p", {
      text: "这个功能是给外部 AI 看的。你在这里写下想让系统如何进化，插件会把系统背景、演化记录和你的新方向写入一个固定 Markdown 文件。外部 AI 读取这个文件后，就能理解 LifeOS 从原始状态到当前状态的变化，并继续做适应性修改。",
      cls: "lifeos-info-text"
    });
    intro.createEl("p", {
      text: `AI 入口文件：${this.plugin.getEvolutionPath()}`,
      cls: "lifeos-info-path"
    });

    const direction = this.addTextarea(parent, "你想提出的进化方向", "例如：我希望目标模块能按照人生领域分组，并显示每个领域的进度");
    const context = this.addTextarea(parent, "使用背景", "你是在什么场景下发现这个需求的？现在用起来哪里不顺？");
    const expected = this.addTextarea(parent, "理想效果", "修改完成后，你希望面板看起来或用起来是什么样子？");

    const actions = parent.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(actions)
      .setButtonText("记录进化方向")
      .setCta()
      .onClick(async () => {
        await this.plugin.addEvolutionRequest({
          direction: direction.value,
          context: context.value,
          expected: expected.value
        });
        new Notice("进化方向已写入系统自我进化文件。");
        this.goBack();
        await this.render();
      });

    new ButtonComponent(actions)
      .setButtonText("打开进化文件")
      .onClick(async () => {
        await this.plugin.ensureFile(this.plugin.getEvolutionPath(), this.plugin.createEvolutionContent());
        const file = this.plugin.app.vault.getAbstractFileByPath(this.plugin.getEvolutionPath());
        if (file instanceof TFile) {
          this.close();
          await this.plugin.app.workspace.getLeaf(true).openFile(file);
        }
      });
  }

  addStat(parent: HTMLElement, label: string, value: string) {
    const item = parent.createDiv({ cls: "lifeos-stat" });
    item.createSpan({ text: label, cls: "lifeos-stat-label" });
    item.createSpan({ text: value, cls: "lifeos-stat-value" });
  }

  async renderTasksPreview(parent: HTMLElement) {
    const card = parent.createDiv({ cls: "lifeos-card lifeos-preview-card" });
    card.addEventListener("click", () => {
      this.navigatePreview("tasks");
      void this.render();
    });
    card.createEl("h3", { text: "待办预览" });
    const tasks = await this.plugin.getOpenTasks(6);
    const list = card.createEl("ul", { cls: "lifeos-card-list" });

    if (tasks.length === 0) {
      list.createEl("li", { text: "没有未完成任务。", cls: "lifeos-empty" });
      return;
    }

    for (const task of tasks) {
      list.createEl("li", { text: task.text });
    }
  }

  async renderItemsPreview(parent: HTMLElement, title: string, folder: string, type: string, previewTarget: string) {
    const card = parent.createDiv({ cls: "lifeos-card lifeos-preview-card" });
    card.addEventListener("click", () => {
      this.navigatePreview(previewTarget);
      void this.render();
    });
    card.createEl("h3", { text: title });
    const items = await this.plugin.getItems(folder, type);
    const list = card.createEl("ul", { cls: "lifeos-card-list" });

    if (items.length === 0) {
      list.createEl("li", { text: "暂无内容。", cls: "lifeos-empty" });
      return;
    }

    for (const item of items) {
      const row = list.createEl("li", { cls: "lifeos-progress" });
      const summary = row.createDiv({ cls: "lifeos-progress-row" });
      summary.createSpan({ text: item.title });
      summary.createSpan({ text: item.progress === null ? item.status : `${item.progress}%` });
      if (item.progress !== null) {
        const progress = row.createEl("progress");
        progress.max = 100;
        progress.value = Math.max(0, Math.min(100, item.progress));
      }
    }
  }

  renderSimplePreview(parent: HTMLElement, title: string, desc: string, previewTarget: string) {
    const card = parent.createDiv({ cls: "lifeos-card lifeos-preview-card" });
    card.addEventListener("click", () => {
      this.navigatePreview(previewTarget);
      void this.render();
    });
    card.createEl("h3", { text: title });
    card.createEl("p", { text: desc, cls: "lifeos-empty" });
  }

  async renderPreviewDetailPanel(parent: HTMLElement) {
    const config = this.getPreviewConfig(this.previewTarget);
    parent.createEl("p", {
      text: `${config.title}预览只展示已经记录的内容，不在这里新增记录。`,
      cls: "lifeos-subtitle"
    });

    const actions = parent.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(actions)
      .setButtonText(`进入${config.recordLabel}`)
      .setCta()
      .onClick(() => {
        this.navigate(config.recordPanel);
        void this.render();
      });

    if (this.previewTarget === "tasks") {
      await this.renderTaskPreviewDetail(parent);
    } else if (this.previewTarget === "goals") {
      await this.renderItemPreviewDetail(parent, "02_目标管理", "goal");
    } else if (this.previewTarget === "projects") {
      await this.renderItemPreviewDetail(parent, "03_任务与项目", "any");
    } else if (this.previewTarget === "learning") {
      await this.renderItemPreviewDetail(parent, "04_学习系统", "learning_note");
    } else if (this.previewTarget === "relationships") {
      await this.renderItemPreviewDetail(parent, "07_人际关系", "relationship");
    } else if (this.previewTarget === "reviews") {
      await this.renderItemPreviewDetail(parent, "11_复盘总结", "review");
    } else if (this.previewTarget === "health") {
      await this.renderModuleRecordPreview(parent, "05_健康管理", "健康记录.md");
    } else if (this.previewTarget === "finance") {
      await this.renderModuleRecordPreview(parent, "06_财务管理", "财务记录.md");
    }
  }

  getPreviewConfig(target: string): { title: string; recordLabel: string; recordPanel: LifeOSPanel } {
    const configs: Record<string, { title: string; recordLabel: string; recordPanel: LifeOSPanel }> = {
      tasks: { title: "待办", recordLabel: "任务面板", recordPanel: "task" },
      goals: { title: "目标", recordLabel: "目标面板", recordPanel: "goal" },
      projects: { title: "项目", recordLabel: "项目面板", recordPanel: "project" },
      learning: { title: "学习", recordLabel: "学习面板", recordPanel: "learning" },
      relationships: { title: "人际", recordLabel: "人际面板", recordPanel: "relationship" },
      health: { title: "健康", recordLabel: "健康面板", recordPanel: "health" },
      finance: { title: "财务", recordLabel: "财务面板", recordPanel: "finance" },
      reviews: { title: "复盘", recordLabel: "复盘面板", recordPanel: "review" }
    };

    return configs[target] ?? configs.tasks;
  }

  async renderTaskPreviewDetail(parent: HTMLElement) {
    const openTasks = await this.plugin.getOpenTasks(50);
    const completedTasks = await this.plugin.getCompletedTasks(30);
    this.renderTaskList(parent, "未完成任务", openTasks);
    this.renderTaskList(parent, "已完成任务", completedTasks);
  }

  renderTaskList(parent: HTMLElement, title: string, tasks: LifeOSTask[]) {
    parent.createEl("h3", { text: title });
    const list = parent.createEl("ul", { cls: "lifeos-card-list lifeos-preview-list" });
    if (tasks.length === 0) {
      list.createEl("li", { text: "暂无内容。", cls: "lifeos-empty" });
      return;
    }

    for (const task of tasks) {
      list.createEl("li", { text: task.text });
    }
  }

  async renderItemPreviewDetail(parent: HTMLElement, folder: string, type: string) {
    const items = await this.plugin.getItems(folder, type, 50);
    const list = parent.createDiv({ cls: "lifeos-preview-detail-grid" });
    if (items.length === 0) {
      list.createEl("p", { text: "暂无内容。", cls: "lifeos-empty" });
      return;
    }

    for (const item of items) {
      const card = list.createDiv({ cls: "lifeos-card" });
      card.createEl("h3", { text: item.title });
      card.createEl("p", { text: `状态：${item.status}`, cls: "lifeos-empty" });
      if (item.progress !== null) {
        const progress = card.createEl("progress");
        progress.max = 100;
        progress.value = Math.max(0, Math.min(100, item.progress));
      }
      new ButtonComponent(card)
        .setButtonText("打开文件")
        .onClick(() => {
          void this.plugin.app.workspace.getLeaf(true).openFile(item.file);
        });
    }
  }

  async renderDailySectionPreview(parent: HTMLElement, heading: string) {
    const entries: Array<{ file: TFile; text: string }> = [];
    const dailyPrefix = this.plugin.databasePath("01_每日记录");
    const files = this.plugin.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(`${dailyPrefix}/`))
      .sort((a, b) => b.basename.localeCompare(a.basename));

    for (const file of files.slice(0, 20)) {
      const content = await this.plugin.app.vault.cachedRead(file);
      for (const line of extractSectionLines(content, heading)) {
        entries.push({ file, text: line });
      }
    }

    const list = parent.createEl("ul", { cls: "lifeos-card-list lifeos-preview-list" });
    if (entries.length === 0) {
      list.createEl("li", { text: "暂无内容。", cls: "lifeos-empty" });
      return;
    }

    for (const entry of entries.slice(0, 50)) {
      list.createEl("li", { text: `${entry.file.basename} · ${entry.text}` });
    }
  }

  async renderModuleRecordPreview(parent: HTMLElement, folder: string, fileName: string) {
    const path = this.plugin.databasePath(folder, fileName);
    const file = this.plugin.app.vault.getAbstractFileByPath(path);
    const list = parent.createEl("ul", { cls: "lifeos-card-list lifeos-preview-list" });
    if (!(file instanceof TFile)) {
      list.createEl("li", { text: "暂无内容。", cls: "lifeos-empty" });
      return;
    }

    const content = await this.plugin.app.vault.cachedRead(file);
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.replace(/^-\s*/, ""));

    if (lines.length === 0) {
      list.createEl("li", { text: "暂无内容。", cls: "lifeos-empty" });
      return;
    }

    for (const line of lines.slice(-50).reverse()) {
      list.createEl("li", { text: line });
    }
  }

  renderPreviewSettingsPanel(parent: HTMLElement) {
    parent.createEl("p", {
      text: "选择主面板下方要显示的预览卡片。预览卡片可以点击进入对应面板。",
      cls: "lifeos-subtitle"
    });

    const options = [
      { id: "tasks", label: "待办预览" },
      { id: "goals", label: "目标预览" },
      { id: "projects", label: "项目预览" },
      { id: "learning", label: "学习预览" },
      { id: "relationships", label: "人际预览" },
      { id: "health", label: "健康预览" },
      { id: "finance", label: "财务预览" },
      { id: "reviews", label: "复盘预览" }
    ];
    const selected = new Set(this.plugin.settings.homePreviewPanels);
    const list = parent.createDiv({ cls: "lifeos-preview-settings" });

    for (const option of options) {
      const row = list.createEl("label", { cls: "lifeos-preview-option" });
      const checkbox = row.createEl("input", { type: "checkbox" });
      checkbox.checked = selected.has(option.id);
      row.createSpan({ text: option.label });
      checkbox.addEventListener("change", async () => {
        if (checkbox.checked) {
          selected.add(option.id);
        } else {
          selected.delete(option.id);
        }
        this.plugin.settings.homePreviewPanels = options
          .map((item) => item.id)
          .filter((id) => selected.has(id));
        await this.plugin.saveSettings();
      });
    }

    const actions = parent.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(actions)
      .setButtonText("保存并返回")
      .setCta()
      .onClick(async () => {
        await this.plugin.saveSettings();
        this.goBack();
        await this.render();
      });
  }

  addInput(parent: HTMLElement, label: string, value: string, placeholder: string) {
    const field = parent.createDiv({ cls: "lifeos-field-wrap" });
    field.createEl("label", { text: label });
    const input = field.createEl("input", {
      type: "text",
      cls: "lifeos-field",
      placeholder
    });
    input.value = value;
    return input;
  }

  addTextarea(parent: HTMLElement, label: string, placeholder: string) {
    const field = parent.createDiv({ cls: "lifeos-field-wrap" });
    field.createEl("label", { text: label });
    return field.createEl("textarea", {
      cls: "lifeos-textarea",
      placeholder
    });
  }

  addSubmit(parent: HTMLElement, text: string, callback: () => Promise<void>) {
    const actions = parent.createDiv({ cls: "lifeos-actions" });
    new ButtonComponent(actions).setButtonText(text).setCta().onClick(() => void callback());
  }
}

class LifeOSSettingTab extends PluginSettingTab {
  plugin: LifeOSPlugin;

  constructor(app: App, plugin: LifeOSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl).setName("Life Manager Dashboard").setHeading();

    new Setting(containerEl)
      .setName("Database folder")
      .setDesc("LifeOS only reads and writes this folder by default.")
      .addText((text) =>
        text
          .setPlaceholder("LifeOS")
          .setValue(this.plugin.settings.databaseFolder)
          .onChange(async (value) => {
            this.plugin.settings.databaseFolder = normalizePath(value.trim() || DEFAULT_SETTINGS.databaseFolder);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Initialize database")
      .setDesc("Create missing folders and starter Markdown files in the configured database folder.")
      .addButton((button) =>
        button.setButtonText("Initialize").onClick(async () => {
          await this.plugin.ensureDatabase();
          new Notice("LifeOS database initialized.");
        })
      );

    new Setting(containerEl)
      .setName("AI API")
      .setDesc("Compatible with OpenAI-style /v1/chat/completions APIs, such as DeepSeek.")
      .setHeading();

    new Setting(containerEl)
      .setName("API URL")
      .setDesc("Base URL, for example https://api.deepseek.com")
      .addText((text) =>
        text
          .setPlaceholder("https://api.deepseek.com")
          .setValue(this.plugin.settings.aiApiUrl)
          .onChange(async (value) => {
            this.plugin.settings.aiApiUrl = value.trim() || DEFAULT_SETTINGS.aiApiUrl;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Model ID")
      .setDesc("For example deepseek-chat, deepseek-reasoner, or another compatible model.")
      .addText((text) =>
        text
          .setPlaceholder("deepseek-chat")
          .setValue(this.plugin.settings.aiModel)
          .onChange(async (value) => {
            this.plugin.settings.aiModel = value.trim() || DEFAULT_SETTINGS.aiModel;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("API Key")
      .setDesc("Stored in Obsidian plugin data on this device.")
      .addText((text) => {
        text.inputEl.type = "password";
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.aiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.aiApiKey = value.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("AI System Prompt")
      .setDesc("Controls how the LifeOS AI assistant behaves.")
      .addTextArea((text) => {
        text.inputEl.rows = 5;
        text
          .setValue(this.plugin.settings.aiSystemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.aiSystemPrompt = value.trim() || DEFAULT_SETTINGS.aiSystemPrompt;
            await this.plugin.saveSettings();
          });
      });
  }
}

function parseFrontmatter(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    return result;
  }

  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trim();
    const separator = line.indexOf(":");

    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    result[key] = value.replace(/^["']|["']$/g, "");
  }

  return result;
}

function updateFrontmatter(content: string, fields: Record<string, string>) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    const generated = Object.entries(fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    return `---\n${generated}\n---\n\n${content}`;
  }

  const existing = parseFrontmatter(content);
  const next = { ...existing, ...fields };
  const yaml = Object.entries(next)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return content.replace(/^---\n[\s\S]*?\n---/, `---\n${yaml}\n---`);
}

function parseNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function appendToSection(content: string, heading: string, line: string) {
  const pattern = new RegExp(`(^## ${escapeRegExp(heading)}\\s*$)`, "m");
  const match = content.match(pattern);

  if (!match || match.index === undefined) {
    return `${content.trimEnd()}\n\n## ${heading}\n\n${line}\n`;
  }

  const headingEnd = match.index + match[0].length;
  const afterHeading = content.slice(headingEnd);
  const nextHeadingIndex = afterHeading.search(/\n##\s+/);

  if (nextHeadingIndex === -1) {
    return `${content.slice(0, headingEnd)}${afterHeading.trimEnd()}\n${line}\n`;
  }

  const insertionIndex = headingEnd + nextHeadingIndex;
  const before = content.slice(0, insertionIndex).trimEnd();
  const after = content.slice(insertionIndex);
  return `${before}\n${line}${after}`;
}

function extractSectionLines(content: string, heading: string) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) {
    return [];
  }

  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const nextHeading = rest.search(/\n##\s+/);
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s*/, ""));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|#^[\]]/g, " ").replace(/\s+/g, " ").trim();
}

function parseAIWriteBlock(block: string) {
  const pathMatch = block.match(/^path:\s*(.+)$/m);
  const modeMatch = block.match(/^mode:\s*(append|overwrite)$/m);
  const contentMatch = block.match(/^content:\s*\n([\s\S]*)$/m);

  if (!pathMatch || !modeMatch || !contentMatch) {
    return null;
  }

  return {
    path: pathMatch[1].trim(),
    mode: modeMatch[1].trim() as "append" | "overwrite",
    content: contentMatch[1].trim()
  };
}
