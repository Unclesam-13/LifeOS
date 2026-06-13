/* LifeOS Obsidian plugin */
var P=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var $=Object.prototype.hasOwnProperty;var A=(h,d)=>{for(var e in d)P(h,e,{get:d[e],enumerable:!0})},D=(h,d,e,t)=>{if(d&&typeof d=="object"||typeof d=="function")for(let n of T(d))!$.call(h,n)&&n!==e&&P(h,n,{get:()=>d[n],enumerable:!(t=E(d,n))||t.enumerable});return h};var I=h=>D(P({},"__esModule",{value:!0}),h);var F={};A(F,{default:()=>y});module.exports=I(F);var o=require("obsidian"),f={databaseFolder:"LifeOS",quickRecordCategories:["\u60F3\u6CD5","\u8BB0\u8D26","\u5B66\u4E60","\u60C5\u7EEA","\u7075\u611F","\u5176\u4ED6"],reviewCategories:["\u65E5\u590D\u76D8","\u5468\u590D\u76D8","\u6708\u590D\u76D8"],financeCurrencies:["USD","CNY","AUD","EUR","GBP","JPY"],homePreviewPanels:["tasks","today","quick","goals","projects","learning","relationships","health","finance","reviews","database","evolution"],aiApiUrl:"https://api.deepseek.com",aiApiKey:"",aiModel:"deepseek-chat",aiSystemPrompt:"\u4F60\u662F LifeOS \u7684\u5185\u7F6E AI \u52A9\u624B\u3002\u4F60\u5E2E\u52A9\u7528\u6237\u7406\u89E3\u548C\u6539\u8FDB LifeOS \u4EBA\u751F\u7BA1\u7406\u7CFB\u7EDF\u3002\u4F60\u53EF\u4EE5\u63D0\u51FA\u5EFA\u8BAE\uFF0C\u4E5F\u53EF\u4EE5\u901A\u8FC7 lifeos-write \u4EE3\u7801\u5757\u8BF7\u6C42\u63D2\u4EF6\u5199\u5165 LifeOS \u6570\u636E\u5E93\u6587\u4EF6\u5939\u3002\u7981\u6B62\u5199\u5165 LifeOS \u6587\u4EF6\u5939\u4E4B\u5916\u7684\u8DEF\u5F84\u3002\u82E5\u4FEE\u6539\u63D2\u4EF6\u6216\u9762\u677F\uFF0C\u5FC5\u987B\u5728\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316\u6587\u4EF6\u4E2D\u7B80\u5316\u8BB0\u5F55\u3002"},L=["00_\u9996\u9875","01_\u6BCF\u65E5\u8BB0\u5F55","02_\u76EE\u6807\u7BA1\u7406","03_\u4EFB\u52A1\u4E0E\u9879\u76EE","04_\u5B66\u4E60\u7CFB\u7EDF","05_\u5065\u5EB7\u7BA1\u7406","06_\u8D22\u52A1\u7BA1\u7406","07_\u4EBA\u9645\u5173\u7CFB","08_\u804C\u4E1A\u53D1\u5C55","09_\u60C5\u7EEA\u4E0E\u81EA\u6211\u89C9\u5BDF","10_\u77E5\u8BC6\u5E93","11_\u590D\u76D8\u603B\u7ED3","12_\u6A21\u677F","99_\u5F52\u6863"],y=class extends o.Plugin{constructor(){super(...arguments);this.modal=null}async onload(){await this.loadSettings(),await this.ensureDatabase(),this.addRibbonIcon("layout-dashboard","Open LifeOS",()=>{this.openLifeOS()}),this.addCommand({id:"open-lifeos-panel",name:"Open LifeOS floating panel",callback:()=>void this.openLifeOS()}),this.addCommand({id:"create-today-note",name:"Create today's LifeOS note",callback:()=>void this.ensureTodayNote().then(()=>new o.Notice("Today's LifeOS note is ready."))}),this.addSettingTab(new S(this.app,this))}onunload(){var e;(e=this.modal)==null||e.close()}async openLifeOS(){await this.ensureDatabase(),this.modal&&this.modal.close(),this.modal=new b(this.app,this),this.modal.open()}async loadSettings(){this.settings=Object.assign({},f,await this.loadData()),Array.isArray(this.settings.quickRecordCategories)||(this.settings.quickRecordCategories=[...f.quickRecordCategories]),Array.isArray(this.settings.reviewCategories)||(this.settings.reviewCategories=[...f.reviewCategories]),Array.isArray(this.settings.financeCurrencies)||(this.settings.financeCurrencies=[...f.financeCurrencies]),Array.isArray(this.settings.homePreviewPanels)||(this.settings.homePreviewPanels=[...f.homePreviewPanels]);let t=["tasks","today","quick","goals","projects","learning","relationships","health","finance","reviews","database","evolution"];for(let n of t)this.settings.homePreviewPanels.includes(n)||this.settings.homePreviewPanels.push(n)}async saveSettings(){await this.saveData(this.settings)}async ensureDatabase(){let e=this.databasePath();await this.ensureFolder(e);for(let t of L)await this.ensureFolder(this.databasePath(t));await this.ensureFile(this.databasePath("system.config.md"),this.createSystemConfig()),await this.ensureFile(this.databasePath("00_\u9996\u9875","\u4EBA\u751F\u4EEA\u8868\u76D8.md"),`# \u4EBA\u751F\u4EEA\u8868\u76D8

\u8FD9\u4E2A\u6587\u4EF6\u7531 LifeOS \u63D2\u4EF6\u521B\u5EFA\u3002\u53EF\u89C6\u5316\u9762\u677F\u4F1A\u4F18\u5148\u4ECE LifeOS \u6570\u636E\u5E93\u6587\u4EF6\u5939\u8BFB\u53D6\u548C\u5199\u5165\u6570\u636E\u3002
`),await this.ensureFile(this.getEvolutionPath(),this.createEvolutionContent()),await this.ensureFile(this.getAiLogPath(),this.createAiLogContent()),await this.ensureFile(this.databasePath("12_\u6A21\u677F","\u6BCF\u65E5\u8BB0\u5F55\u6A21\u677F.md"),this.createDailyNoteContent(this.today())),await this.ensureFile(this.getAIWriteGuidePath(),this.createAIWriteGuideContent()),await this.ensureFile(this.getQuickRecordPath(),this.createQuickRecordContent()),await this.ensureModuleTemplates(),await this.migrateLegacyModuleRecords(),await this.migrateLegacyQuickRecords(),await this.ensureFolder(this.databasePath("04_\u5B66\u4E60\u7CFB\u7EDF","\u82F1\u8BED")),await this.ensureFile(this.getVocabularyPath(),this.createVocabularyContent()),await this.ensureFile(this.databasePath("03_\u4EFB\u52A1\u4E0E\u9879\u76EE","\u9879\u76EE\u6E05\u5355.md"),`---
type: project_index
status: \u8FDB\u884C\u4E2D
---

# \u9879\u76EE\u6E05\u5355

## \u4EFB\u52A1\u6E05\u5355

- [ ] \u642D\u5EFA LifeOS \u7B2C\u4E00\u7248\u9762\u677F #task #project
`),await this.ensureFile(this.databasePath("02_\u76EE\u6807\u7BA1\u7406",`${new Date().getFullYear()}\u5E74\u5EA6\u76EE\u6807.md`),`---
type: goal
title: ${new Date().getFullYear()}\u5E74\u5EA6\u76EE\u6807
status: \u8FDB\u884C\u4E2D
progress: 0
priority: P1
---

# ${new Date().getFullYear()}\u5E74\u5EA6\u76EE\u6807

## \u76EE\u6807\u6E05\u5355

- [ ] \u5199\u4E0B\u4ECA\u5E74\u6700\u91CD\u8981\u7684\u4E09\u4E2A\u76EE\u6807 #task #goal
`)}databasePath(...e){return(0,o.normalizePath)([this.settings.databaseFolder,...e].join("/"))}async ensureFolder(e){let t=(0,o.normalizePath)(e);this.app.vault.getAbstractFileByPath(t)||await this.app.vault.createFolder(t)}async ensureFile(e,t){let n=(0,o.normalizePath)(e);this.app.vault.getAbstractFileByPath(n)||await this.app.vault.create(n,t)}today(){return window.moment().format("YYYY-MM-DD")}getTodayPath(){return this.databasePath("01_\u6BCF\u65E5\u8BB0\u5F55",`${this.today()}.md`)}getQuickRecordPath(){return this.databasePath("01_\u6BCF\u65E5\u8BB0\u5F55","\u5FEB\u901F\u8BB0\u5F55.md")}getFinanceRecordPath(){return this.databasePath("06_\u8D22\u52A1\u7BA1\u7406","\u8D22\u52A1\u8BB0\u5F55.md")}getHealthRecordPath(){return this.databasePath("05_\u5065\u5EB7\u7BA1\u7406","\u5065\u5EB7\u8BB0\u5F55.md")}getReviewPath(e){return this.databasePath("11_\u590D\u76D8\u603B\u7ED3",`${v(e)}.md`)}createReviewFileContent(e){return`---
type: review
title: ${e}
scope: ${e}
updated_at: ${this.today()}
---

# ${e}

`}getEvolutionPath(){return this.databasePath("00_\u9996\u9875","\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316.md")}getAiLogPath(){return this.databasePath("00_\u9996\u9875","AI\u95EE\u7B54\u8BB0\u5F55.md")}getVocabularyPath(){return this.databasePath("04_\u5B66\u4E60\u7CFB\u7EDF","\u82F1\u8BED","\u5355\u8BCD\u95EA\u5361.md")}getAIWriteGuidePath(){return this.databasePath("12_\u6A21\u677F","AI\u5199\u5165\u89C4\u8303.md")}createSystemConfig(){return`---
type: system_config
version: ${this.manifest.version}
database_name: ${this.settings.databaseFolder}
created_at: ${this.today()}
schema_version: 1
---

# LifeOS \u7CFB\u7EDF\u914D\u7F6E

\u8FD9\u4E2A\u6587\u4EF6\u7531\u63D2\u4EF6\u7EF4\u62A4\uFF0C\u7528\u4E8E\u8BB0\u5F55\u4EBA\u751F\u7BA1\u7406\u7CFB\u7EDF\u7684\u6570\u636E\u5E93\u7248\u672C\u3001\u6587\u4EF6\u5939\u7ED3\u6784\u548C\u5B57\u6BB5\u89C4\u8303\u3002
`}createDailyNoteContent(e){return`---
type: daily
date: ${e}
mood: 
energy: 
sleep: 
exercise: false
---

# ${e}

## \u4ECA\u65E5\u91CD\u70B9

- [ ] 

## \u5B66\u4E60\u8BB0\u5F55


## \u5065\u5EB7\u8BB0\u5F55

- \u7761\u7720\uFF1A
- \u8FD0\u52A8\uFF1A
- \u996E\u98DF\uFF1A
- \u7CBE\u529B\u8BC4\u5206\uFF1A/10

## \u60C5\u7EEA\u8BB0\u5F55

- \u4ECA\u65E5\u60C5\u7EEA\uFF1A
- \u89E6\u53D1\u539F\u56E0\uFF1A
- \u6211\u5982\u4F55\u56DE\u5E94\uFF1A

## \u6D88\u8D39\u8BB0\u5F55


## \u4ECA\u65E5\u590D\u76D8

- \u505A\u5F97\u597D\u7684\uFF1A
- \u53EF\u4EE5\u6539\u8FDB\u7684\uFF1A
- \u660E\u5929\u6700\u91CD\u8981\u7684\u4E00\u4EF6\u4E8B\uFF1A
`}createQuickRecordContent(){return`---
type: quick_record
title: \u5FEB\u901F\u8BB0\u5F55
updated_at: ${this.today()}
format: "timestamp | category | content"
---

# \u5FEB\u901F\u8BB0\u5F55

`}createEvolutionContent(){return`---
type: system_evolution
version: ${this.manifest.version}
created_at: ${this.today()}
updated_at: ${this.today()}
for_external_ai: true
---

# \u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316

## \u7ED9\u5916\u90E8 AI \u7684\u7B80\u5316\u8BF4\u660E

LifeOS \u662F\u4E00\u4E2A Obsidian \u63D2\u4EF6\u3002\u5B83\u7684\u76EE\u6807\u662F\u628A Obsidian \u53D8\u6210\u4E00\u4E2A\u4F4E\u5B66\u4E60\u6210\u672C\u7684\u4EBA\u751F\u7BA1\u7406\u7CFB\u7EDF\uFF1AMarkdown \u6587\u4EF6\u4F5C\u4E3A\u6570\u636E\u5E93\uFF0C\u60AC\u6D6E\u53EF\u89C6\u5316\u9762\u677F\u4F5C\u4E3A\u64CD\u4F5C\u754C\u9762\u3002\u7528\u6237\u5C3D\u91CF\u4E0D\u76F4\u63A5\u7F16\u8F91 Markdown\uFF0C\u800C\u662F\u5728\u9762\u677F\u91CC\u586B\u5199\u3001\u70B9\u51FB\u3001\u52FE\u9009\u548C\u521B\u5EFA\u5185\u5BB9\u3002\u63D2\u4EF6\u9ED8\u8BA4\u53EA\u8BFB\u5199\u5F53\u524D Obsidian \u4ED3\u5E93\u4E2D\u7684 LifeOS \u6570\u636E\u5E93\u6587\u4EF6\u5939\uFF0C\u4E0D\u4E3B\u52A8\u4FEE\u6539\u5176\u4ED6\u7B14\u8BB0\u3002

\u5916\u90E8 AI \u4FEE\u6539\u8FD9\u4E2A\u7CFB\u7EDF\u65F6\uFF0C\u5E94\u8BE5\u4F18\u5148\u7406\u89E3\u7528\u6237\u771F\u5B9E\u60F3\u8981\u7684\u4F7F\u7528\u4F53\u9A8C\uFF0C\u7136\u540E\u518D\u4FEE\u6539\u63D2\u4EF6\u4EE3\u7801\u3001Markdown \u6570\u636E\u7ED3\u6784\u6216\u9762\u677F\u4EA4\u4E92\u3002\u4FEE\u6539\u5E94\u4FDD\u6301\u4E00\u4E2A\u539F\u5219\uFF1A\u8BA9\u7528\u6237\u66F4\u5C11\u63A5\u89E6\u590D\u6742\u8BED\u6CD5\uFF0C\u8BA9\u7CFB\u7EDF\u66F4\u8D34\u5408\u7528\u6237\u81EA\u5DF1\u7684\u751F\u6D3B\u7BA1\u7406\u65B9\u5F0F\u3002

## \u539F\u59CB\u72B6\u6001

- \u7CFB\u7EDF\u4ECE\u4E00\u4E2A Markdown \u89C4\u5212\u6587\u4EF6\u5F00\u59CB\u3002
- \u7B2C\u4E00\u7248\u8981\u6C42\u662F\u57FA\u4E8E Obsidian \u7BA1\u7406\u751F\u6D3B\u548C\u5B66\u4E60\u3002
- \u540E\u7EED\u786E\u5B9A\u63D2\u4EF6\u5F62\u5F0F\uFF1A\u5B89\u88C5\u540E\u5728\u5F53\u524D\u4ED3\u5E93\u6839\u76EE\u5F55\u521B\u5EFA\u72EC\u7ACB LifeOS \u6570\u636E\u5E93\u6587\u4EF6\u5939\u3002
- \u518D\u540E\u7EED\u786E\u5B9A\u4EA4\u4E92\u5F62\u5F0F\uFF1A\u60AC\u6D6E\u9762\u677F\u3001\u4E3B\u9762\u677F\u3001\u5B50\u9762\u677F\u3001\u8FD4\u56DE\u6309\u94AE\u3001\u5173\u95ED\u6309\u94AE\u3001\u653E\u5927\u6309\u94AE\u3002
- \u5F53\u524D\u65B9\u5411\u662F\uFF1A\u6240\u6709\u4E3B\u8981\u586B\u5199\u52A8\u4F5C\u90FD\u901A\u8FC7\u9762\u677F\u5B8C\u6210\uFF0C\u5E76\u628A\u5185\u5BB9\u5199\u5165 LifeOS \u6587\u4EF6\u5939\u4E0B\u7684 Markdown\u3002

## \u81EA\u9002\u5E94\u8FDB\u5316\u8FC7\u7A0B

- 2026-06-09\uFF1A\u521B\u5EFA LifeOS \u63D2\u4EF6\u9AA8\u67B6\uFF0C\u652F\u6301\u72EC\u7ACB\u6570\u636E\u5E93\u6587\u4EF6\u5939\u3002
- 2026-06-09\uFF1A\u6539\u4E3A\u60AC\u6D6E\u9762\u677F\uFF0C\u52A0\u5165\u4E3B\u9762\u677F\u548C\u5B50\u9762\u677F\u5BFC\u822A\u3002
- 2026-06-09\uFF1A\u6269\u5C55\u4ECA\u65E5\u3001\u4EFB\u52A1\u3001\u5FEB\u901F\u8BB0\u5F55\u3001\u76EE\u6807\u3001\u9879\u76EE\u3001\u5B66\u4E60\u3001\u5065\u5EB7\u3001\u8D22\u52A1\u3001\u4EBA\u9645\u3001\u590D\u76D8\u548C\u6570\u636E\u5E93\u6A21\u5757\u3002
- 2026-06-09\uFF1A\u52A0\u5165\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316\u529F\u80FD\uFF0C\u4E13\u95E8\u4E3A\u5916\u90E8 AI \u63D0\u4F9B\u7CFB\u7EDF\u80CC\u666F\u3001\u6F14\u5316\u8BB0\u5F55\u548C\u7528\u6237\u672A\u6765\u65B9\u5411\u3002

## \u5F53\u524D\u7CFB\u7EDF\u8FB9\u754C

- \u9ED8\u8BA4\u6570\u636E\u5E93\u6587\u4EF6\u5939\uFF1ALifeOS/
- \u63D2\u4EF6\u5B89\u88C5\u76EE\u5F55\u901A\u5E38\u662F\uFF1A.obsidian/plugins/lifeos/
- \u5916\u90E8 AI \u5982\u679C\u8981\u4FEE\u6539\u63D2\u4EF6\uFF0C\u5E94\u4F18\u5148\u67E5\u770B\u63D2\u4EF6\u76EE\u5F55\u4E2D\u7684 main.ts\u3001styles.css\u3001manifest.json\u3002
- \u5916\u90E8 AI \u5982\u679C\u8981\u7406\u89E3\u7528\u6237\u9700\u6C42\uFF0C\u5E94\u4F18\u5148\u8BFB\u53D6\u672C\u6587\u4EF6\u3002
- \u4E0D\u8981\u9ED8\u8BA4\u79FB\u52A8\u3001\u5220\u9664\u6216\u8986\u76D6\u7528\u6237\u539F\u6709 Obsidian \u7B14\u8BB0\u3002
- \u5982\u9700\u8FC1\u79FB\u65E7\u7B14\u8BB0\uFF0C\u5E94\u91C7\u7528\u590D\u5236\u8F6C\u6362\u65B9\u5F0F\u5199\u5165 LifeOS \u6570\u636E\u5E93\u6587\u4EF6\u5939\u3002

## \u7528\u6237\u63D0\u51FA\u7684\u8FDB\u5316\u65B9\u5411


## \u5916\u90E8 AI \u4FEE\u6539\u5EFA\u8BAE\u683C\u5F0F

\u5916\u90E8 AI \u6BCF\u6B21\u4FEE\u6539\u524D\uFF0C\u5EFA\u8BAE\u5148\u6574\u7406\u4EE5\u4E0B\u5185\u5BB9\uFF1A

1. \u7528\u6237\u8FD9\u6B21\u771F\u6B63\u60F3\u89E3\u51B3\u7684\u95EE\u9898\u3002
2. \u5F53\u524D\u7CFB\u7EDF\u4E2D\u6700\u63A5\u8FD1\u8FD9\u4E2A\u9700\u6C42\u7684\u6A21\u5757\u3002
3. \u9700\u8981\u65B0\u589E\u6216\u4FEE\u6539\u7684\u9762\u677F\u3002
4. \u9700\u8981\u65B0\u589E\u6216\u4FEE\u6539\u7684 Markdown \u6570\u636E\u683C\u5F0F\u3002
5. \u4FEE\u6539\u540E\u5982\u4F55\u9A8C\u8BC1\u3002

## \u5916\u90E8 AI \u4FEE\u6539\u63D2\u4EF6\u8BB0\u5F55\u51C6\u5219

\u53EA\u8981\u5916\u90E8 AI \u4FEE\u6539\u4E86 LifeOS \u63D2\u4EF6\uFF08\u5982 .obsidian/plugins/lifeos/ \u4E0B\u7684 main.js\u3001styles.css\u3001manifest.json\uFF09\uFF0C\u5C31\u5FC5\u987B\u5728\u672C\u6587\u4EF6\u505A\u7B80\u5316\u8BB0\u5F55\uFF0C\u4E0D\u53EF\u53EA\u6539\u4EE3\u7801\u4E0D\u7559\u8BB0\u3002

1. \u300C\u7528\u6237\u63D0\u51FA\u7684\u8FDB\u5316\u65B9\u5411\u300D\uFF1A\u8FFD\u52A0 \`### YYYY-MM-DD HH:mm\` \u548C \`- \u6539\u8FDB\u95EE\u9898\uFF1A...\`
2. \u300C\u5DF2\u5B8C\u6210\u4FEE\u6539\u8BB0\u5F55\u300D\uFF1A\u8FFD\u52A0\u540C\u4E00\u65F6\u95F4\u6233\uFF0C\u5305\u542B \`- \u6539\u8FDB\u95EE\u9898\uFF1A...\`\uFF08\u5982\u6709\uFF09\u548C \`- YYYY-MM-DD\uFF1A\u5B8C\u6210/\u4FEE\u590D...\`\uFF08\u4E00\u53E5\u8BDD\u6458\u8981\uFF09
3. \u300C\u81EA\u9002\u5E94\u8FDB\u5316\u8FC7\u7A0B\u300D\uFF1A\u8FFD\u52A0 \`- YYYY-MM-DD\uFF1A\u7B80\u77ED\u6458\u8981\`
4. \u66F4\u65B0 frontmatter \u7684 updated_at
5. \u8BB0\u5F55\u8981\u7B80\u5316\uFF0C\u4E0D\u8D34\u5927\u6BB5\u4EE3\u7801\u6216\u65E5\u5FD7

\u901A\u8FC7\u5185\u7F6E AI \u5199\u5165\u65F6\uFF0C\u4F7F\u7528 lifeos-write \u5BF9\u672C\u6587\u4EF6 mode: append\uFF0C\u7981\u6B62 overwrite \u6574\u4E2A\u6587\u4EF6\u3002

## \u5DF2\u5B8C\u6210\u4FEE\u6539\u8BB0\u5F55

`}createVocabularyContent(){return`---
type: vocabulary_flashcards
subject: \u82F1\u8BED
updated_at: ${this.today()}
format: "- [ ] word :: meaning :: example"
---

# \u82F1\u8BED\u5355\u8BCD\u95EA\u5361

## \u5355\u8BCD\u5217\u8868

- [ ] example :: \u4F8B\u5B50\uFF1B\u793A\u4F8B :: This is an example sentence.
`}createAiLogContent(){return`---
type: ai_chat_log
created_at: ${this.today()}
updated_at: ${this.today()}
---

# AI \u95EE\u7B54\u8BB0\u5F55

`}createAIWriteGuideContent(){return`---
type: ai_write_guide
updated_at: ${this.today()}
for_external_ai: true
---

# LifeOS AI \u5199\u5165\u89C4\u8303

## \u6838\u5FC3\u539F\u5219

AI \u4FEE\u6539 LifeOS \u6570\u636E\u65F6\uFF0C\u5FC5\u987B\u4F18\u5148\u6309\u7167\u672C\u6587\u4EF6\u9009\u62E9\u5199\u5165\u4F4D\u7F6E\u548C\u683C\u5F0F\u3002\u4E0D\u8981\u628A\u6240\u6709\u5185\u5BB9\u90FD\u5199\u8FDB\u6BCF\u65E5\u8BB0\u5F55\u3002\u5FEB\u901F\u8BB0\u5F55\u5199\u5165\u72EC\u7ACB\u6587\u4EF6\uFF1B\u6BCF\u65E5\u8BB0\u5F55\u53EA\u7528\u4E8E\u5F53\u5929\u60C5\u7EEA\u3001\u7CBE\u529B\u3001\u7761\u7720\u3001\u4ECA\u65E5\u91CD\u70B9\u548C\u590D\u76D8\uFF1B\u7ED3\u6784\u5316\u5185\u5BB9\u5E94\u8BE5\u5199\u5165\u5BF9\u5E94\u6A21\u5757\u6587\u4EF6\u5939\u3002

\u6240\u6709\u5199\u5165\u5FC5\u987B\u4F4D\u4E8E LifeOS/ \u6570\u636E\u5E93\u6587\u4EF6\u5939\u5185\u3002\u4E0D\u8981\u79FB\u52A8\u3001\u5220\u9664\u6216\u8986\u76D6\u7528\u6237\u539F\u6709 Obsidian \u7B14\u8BB0\u3002

## \u6A21\u5757\u5199\u5165\u4F4D\u7F6E

| \u7528\u6237\u610F\u56FE | \u5199\u5165\u4F4D\u7F6E | \u63A8\u8350\u683C\u5F0F |
| --- | --- | --- |
| \u65B0\u589E\u4EFB\u52A1 | LifeOS/03_\u4EFB\u52A1\u4E0E\u9879\u76EE/\u9879\u76EE\u6E05\u5355.md \u6216\u5177\u4F53\u9879\u76EE\u6587\u4EF6 | Markdown task |
| \u65B0\u589E\u76EE\u6807 | LifeOS/02_\u76EE\u6807\u7BA1\u7406/\u76EE\u6807\u540D\u79F0.md | goal frontmatter |
| \u65B0\u589E\u9879\u76EE | LifeOS/03_\u4EFB\u52A1\u4E0E\u9879\u76EE/\u9879\u76EE\u540D\u79F0.md | project frontmatter |
| \u5B66\u4E60\u7B14\u8BB0 | LifeOS/04_\u5B66\u4E60\u7CFB\u7EDF/\u4E3B\u9898.md | learning_note frontmatter |
| \u82F1\u8BED\u5355\u8BCD | LifeOS/04_\u5B66\u4E60\u7CFB\u7EDF/\u82F1\u8BED/\u5355\u8BCD\u95EA\u5361.md | - [ ] word :: meaning :: example |
| \u5065\u5EB7\u8BB0\u5F55 | LifeOS/05_\u5065\u5EB7\u7BA1\u7406/\u5065\u5EB7\u8BB0\u5F55.md | timestamp category value note |
| \u8D22\u52A1\u8BB0\u5F55 | LifeOS/06_\u8D22\u52A1\u7BA1\u7406/\u8D22\u52A1\u8BB0\u5F55.md | timestamp expense income currency reason note |
| \u8054\u7CFB\u4EBA | LifeOS/07_\u4EBA\u9645\u5173\u7CFB/\u59D3\u540D.md | relationship frontmatter |
| \u590D\u76D8 | LifeOS/11_\u590D\u76D8\u603B\u7ED3/\u590D\u76D8\u79CD\u7C7B.md | date section free text |
| \u5FEB\u901F\u8BB0\u5F55 | LifeOS/01_\u6BCF\u65E5\u8BB0\u5F55/\u5FEB\u901F\u8BB0\u5F55.md | timestamp category content |
| \u4ECA\u65E5\u586B\u5199 | LifeOS/01_\u6BCF\u65E5\u8BB0\u5F55/YYYY-MM-DD.md | mood energy sleep task review |

## \u53D7\u63A7\u5199\u5165\u683C\u5F0F

\u5982\u679C\u9700\u8981\u8BA9\u63D2\u4EF6\u76F4\u63A5\u5199\u5165\u6587\u4EF6\uFF0C\u4F7F\u7528\uFF1A

\`\`\`lifeos-write
path: LifeOS/\u6A21\u5757\u8DEF\u5F84/\u6587\u4EF6\u540D.md
mode: append
content:
\u8981\u5199\u5165\u7684 Markdown \u5185\u5BB9
\`\`\`

mode \u53EF\u7528 append \u6216 overwrite\u3002\u9664\u975E\u7528\u6237\u660E\u786E\u8981\u6C42\u91CD\u5199\u6587\u4EF6\uFF0C\u5426\u5219\u4F7F\u7528 append\u3002

## \u6A21\u677F\u7D22\u5F15

- \u4EFB\u52A1\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u4EFB\u52A1.md
- \u76EE\u6807\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u76EE\u6807.md
- \u9879\u76EE\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u9879\u76EE.md
- \u5B66\u4E60\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u5B66\u4E60.md
- \u82F1\u8BED\u5355\u8BCD\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u82F1\u8BED\u5355\u8BCD.md
- \u5065\u5EB7\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u5065\u5EB7.md
- \u8D22\u52A1\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u8D22\u52A1.md
- \u4EBA\u9645\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u4EBA\u9645.md
- \u590D\u76D8\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u590D\u76D8.md
- \u5FEB\u901F\u8BB0\u5F55\u6A21\u677F\uFF1ALifeOS/12_\u6A21\u677F/AI\u6A21\u677F-\u5FEB\u901F\u8BB0\u5F55.md

## \u5916\u90E8 AI \u4FEE\u6539\u63D2\u4EF6\u51C6\u5219

\u53EA\u8981\u5916\u90E8 AI \u4FEE\u6539\u4E86 LifeOS \u63D2\u4EF6\u4EE3\u7801\u6216\u9762\u677F\u4EA4\u4E92\uFF0C\u5FC5\u987B\u5728 LifeOS/00_\u9996\u9875/\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316.md \u505A\u7B80\u5316\u8BB0\u5F55\uFF08\u8BE6\u89C1\u8BE5\u6587\u4EF6\u300C\u5916\u90E8 AI \u4FEE\u6539\u63D2\u4EF6\u8BB0\u5F55\u51C6\u5219\u300D\uFF09\u3002\u4F18\u5148\u7528 lifeos-write + append \u5199\u5165\uFF0C\u7981\u6B62 overwrite \u6574\u4E2A\u8FDB\u5316\u6587\u4EF6\u3002
`}async ensureModuleTemplates(){let e={"AI\u6A21\u677F-\u4EFB\u52A1.md":`# AI \u6A21\u677F - \u4EFB\u52A1

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/03_\u4EFB\u52A1\u4E0E\u9879\u76EE/\u9879\u76EE\u6E05\u5355.md\` \u6216\u5177\u4F53\u9879\u76EE\u6587\u4EF6\u3002

\u683C\u5F0F\uFF1A

\`\`\`markdown
- [ ] \u4EFB\u52A1\u5185\u5BB9 #task
\`\`\`

\u793A\u4F8B\uFF1A

\`\`\`markdown
- [ ] \u89E3\u51B3 8 \u4E2A\u6A21\u578B\u7684\u53C2\u6570\u95EE\u9898 #task
\`\`\`
`,"AI\u6A21\u677F-\u76EE\u6807.md":`# AI \u6A21\u677F - \u76EE\u6807

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/02_\u76EE\u6807\u7BA1\u7406/\u76EE\u6807\u540D\u79F0.md\`

\`\`\`markdown
---
type: goal
title: \u76EE\u6807\u540D\u79F0
status: \u8FDB\u884C\u4E2D
area: 
deadline: YYYY-MM-DD
progress: 0
priority: P2
---

# \u76EE\u6807\u540D\u79F0

## \u4E3A\u4EC0\u4E48\u91CD\u8981


## \u6210\u529F\u6807\u51C6


## \u4E0B\u4E00\u6B65\u884C\u52A8

- [ ] 
\`\`\`
`,"AI\u6A21\u677F-\u9879\u76EE.md":`# AI \u6A21\u677F - \u9879\u76EE

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/03_\u4EFB\u52A1\u4E0E\u9879\u76EE/\u9879\u76EE\u540D\u79F0.md\`

\`\`\`markdown
---
type: project
title: \u9879\u76EE\u540D\u79F0
status: \u8FDB\u884C\u4E2D
area: 
deadline: YYYY-MM-DD
progress: 0
---

# \u9879\u76EE\u540D\u79F0

## \u9879\u76EE\u76EE\u6807


## \u4EFB\u52A1\u6E05\u5355

- [ ] 

## \u8FDB\u5EA6\u8BB0\u5F55


## \u9879\u76EE\u590D\u76D8

\`\`\`
`,"AI\u6A21\u677F-\u5B66\u4E60.md":`# AI \u6A21\u677F - \u5B66\u4E60

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/04_\u5B66\u4E60\u7CFB\u7EDF/\u4E3B\u9898.md\`

\`\`\`markdown
---
type: learning_note
title: \u4E3B\u9898
status: \u8FDB\u884C\u4E2D
source: 
created: YYYY-MM-DD
review_count: 0
---

# \u4E3B\u9898

## \u6765\u6E90


## \u6838\u5FC3\u5185\u5BB9


## \u6211\u7684\u7406\u89E3


## \u53EF\u5E94\u7528\u573A\u666F


## \u4E0B\u4E00\u6B65

- [ ] 
\`\`\`
`,"AI\u6A21\u677F-\u82F1\u8BED\u5355\u8BCD.md":"# AI \u6A21\u677F - \u82F1\u8BED\u5355\u8BCD\n\n\u5199\u5165\u4F4D\u7F6E\uFF1A`LifeOS/04_\u5B66\u4E60\u7CFB\u7EDF/\u82F1\u8BED/\u5355\u8BCD\u95EA\u5361.md`\n\n\u53EA\u8FFD\u52A0\u5230 `## \u5355\u8BCD\u5217\u8868` \u4E0B\u65B9\u3002\n\n```markdown\n- [ ] word :: \u4E2D\u6587\u91CA\u4E49 :: English example sentence.\n```\n","AI\u6A21\u677F-\u5065\u5EB7.md":`# AI \u6A21\u677F - \u5065\u5EB7

\u4F18\u5148\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/05_\u5065\u5EB7\u7BA1\u7406/\u5065\u5EB7\u8BB0\u5F55.md\`

\`\`\`markdown
## YYYY-MM-DD

- YYYY-MM-DD HH:mm | \u7761\u7720/\u8FD0\u52A8/\u996E\u98DF/\u7CBE\u529B/\u4F53\u91CD | \u8BB0\u5F55\u5185\u5BB9 | \u5907\u6CE8
\`\`\`

\u5982\u679C\u7528\u6237\u660E\u786E\u8BF4\u662F\u4ECA\u65E5\u6D41\u6C34\uFF0C\u4E5F\u53EF\u4EE5\u5199\u5165\u5F53\u5929\u6BCF\u65E5\u8BB0\u5F55\u7684 \`## \u5065\u5EB7\u8BB0\u5F55\`\u3002
`,"AI\u6A21\u677F-\u8D22\u52A1.md":`# AI \u6A21\u677F - \u8D22\u52A1

\u4F18\u5148\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/06_\u8D22\u52A1\u7BA1\u7406/\u8D22\u52A1\u8BB0\u5F55.md\`

\`\`\`markdown
## YYYY-MM-DD

- YYYY-MM-DD HH:mm | \u652F\u51FA\uFF1A\u91D1\u989D | \u6536\u5165\uFF1A\u91D1\u989D | \u5E01\u79CD\uFF1ACNY | \u539F\u56E0\uFF1A\u5206\u7C7B | \u5907\u6CE8\uFF1A\u8BF4\u660E
\`\`\`

\u5B57\u6BB5\u8BF4\u660E\uFF1A\u652F\u51FA\u548C\u6536\u5165\u4E8C\u9009\u4E00\uFF0C\u6CA1\u6709\u7684\u9879\u586B 0\u3002\u5E01\u79CD\u4F8B\u5982 USD\u3001CNY\u3001AUD\u3002\u539F\u56E0\u662F\u8D22\u52A1\u5206\u7C7B\u6216\u6765\u6E90\uFF08\u9910\u996E\u3001\u5DE5\u8D44\u3001\u4EA4\u901A\u7B49\uFF09\u3002

\u6279\u91CF\u5BFC\u5165\u793A\u4F8B\uFF1A

\`\`\`markdown
## 2026-06-09

- 2026-06-09 12:30 | \u652F\u51FA\uFF1A35 | \u6536\u5165\uFF1A0 | \u5E01\u79CD\uFF1AUSD | \u539F\u56E0\uFF1A\u9910\u996E | \u5907\u6CE8\uFF1AKFC
- 2026-06-09 18:00 | \u652F\u51FA\uFF1A0 | \u6536\u5165\uFF1A2000 | \u5E01\u79CD\uFF1ACNY | \u539F\u56E0\uFF1A\u5DE5\u8D44 | \u5907\u6CE8\uFF1A\u6708\u85AA
\`\`\`
`,"AI\u6A21\u677F-\u4EBA\u9645.md":`# AI \u6A21\u677F - \u4EBA\u9645

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/07_\u4EBA\u9645\u5173\u7CFB/\u59D3\u540D.md\`

\`\`\`markdown
---
type: relationship
name: \u59D3\u540D
relation: 
birthday: 
city: 
last_contact: YYYY-MM-DD
---

# \u59D3\u540D

## \u57FA\u672C\u4FE1\u606F

- \u5173\u7CFB\uFF1A
- \u751F\u65E5\uFF1A
- \u57CE\u5E02\uFF1A

## \u91CD\u8981\u4FE1\u606F

- \u559C\u6B22\uFF1A

## \u6700\u8FD1\u4E92\u52A8

- YYYY-MM-DD 

## \u53EF\u4EE5\u5173\u5FC3\u7684\u4E8B

- [ ] 
\`\`\`
`,"AI\u6A21\u677F-\u590D\u76D8.md":`# AI \u6A21\u677F - \u590D\u76D8

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/11_\u590D\u76D8\u603B\u7ED3/\u590D\u76D8\u79CD\u7C7B.md\` \uFF08\u6BCF\u79CD\u590D\u76D8\u4E00\u4E2A\u6587\u4EF6\uFF0C\u4E0D\u6309\u5929\u62C6\u5206\uFF09

\u590D\u76D8\u662F\u81EA\u7531\u5199\u4F5C\uFF0C\u4E0D\u8981\u5206\u6210\u9AD8\u5149\u3001\u95EE\u9898\u3001\u4E0B\u4E00\u6B65\u7B49\u5C0F\u6807\u9898\u3002\u6309\u65E5\u671F\u5206\u7EC4\u8FFD\u52A0\uFF1A

\`\`\`markdown
---
type: review
title: \u590D\u76D8\u79CD\u7C7B
scope: \u590D\u76D8\u79CD\u7C7B
updated_at: YYYY-MM-DD
---

# \u590D\u76D8\u79CD\u7C7B

## YYYY-MM-DD

\u5728\u8FD9\u91CC\u76F4\u63A5\u5199\u590D\u76D8\u5185\u5BB9\u3002
\`\`\`

\u540C\u4E00\u5929\u518D\u6B21\u5199\u5165\u65F6\uFF0C\u8FFD\u52A0\u5230\u540C\u4E00\u4E2A \`## YYYY-MM-DD\` \u533A\u5757\u5185\u3002

\`\`\`markdown
## 2026-06-10

\u4ECA\u5929\u7684\u590D\u76D8\u5185\u5BB9\u3002

## 2026-06-09

\u6628\u5929\u7684\u590D\u76D8\u5185\u5BB9\u3002
\`\`\`
`,"AI\u6A21\u677F-\u5FEB\u901F\u8BB0\u5F55.md":`# AI \u6A21\u677F - \u5FEB\u901F\u8BB0\u5F55

\u5199\u5165\u4F4D\u7F6E\uFF1A\`LifeOS/01_\u6BCF\u65E5\u8BB0\u5F55/\u5FEB\u901F\u8BB0\u5F55.md\`

\u6309\u65E5\u671F\u5206\u7EC4\uFF0C\u6BCF\u6761\u4E00\u884C\uFF1A

\`\`\`markdown
## YYYY-MM-DD

- YYYY-MM-DD HH:mm | \u5206\u7C7B | \u5185\u5BB9
\`\`\`

\u5206\u7C7B\u5E38\u89C1\u503C\uFF1A\u60F3\u6CD5\u3001\u5B66\u4E60\u3001\u60C5\u7EEA\u3001\u7075\u611F\u3001\u5176\u4ED6\u3002

\u8BB0\u8D26\u3001\u6D88\u8D39\u3001\u8D22\u52A1\u3001\u8D2D\u7269\u7C7B\u5E94\u5199\u5165 \`LifeOS/06_\u8D22\u52A1\u7BA1\u7406/\u8D22\u52A1\u8BB0\u5F55.md\`\uFF0C\u4E0D\u8981\u5199\u8FDB\u5FEB\u901F\u8BB0\u5F55\u3002

\u6279\u91CF\u5BFC\u5165\u65F6\uFF0C\u53EF\u5728\u540C\u4E00\u65E5\u671F\u4E0B\u8FDE\u7EED\u8FFD\u52A0\u591A\u6761\uFF1A

\`\`\`markdown
## 2026-06-09

- 2026-06-09 10:30 | \u60F3\u6CD5 | \u60F3\u505A\u4E00\u4E2A\u66F4\u8F7B\u7684\u5FEB\u901F\u8BB0\u5F55\u6A21\u5757
- 2026-06-09 14:00 | \u5B66\u4E60 | \u5B8C\u6210\u4E86 TypeScript \u7C7B\u578B\u7AE0\u8282
- 2026-06-09 20:15 | \u60C5\u7EEA | \u4ECA\u5929\u6709\u70B9\u7126\u8651\uFF0C\u4F46\u665A\u4E0A\u8C03\u6574\u597D\u4E86
\`\`\`
`};for(let[t,n]of Object.entries(e))await this.ensureFile(this.databasePath("12_\u6A21\u677F",t),n)}async ensureTodayNote(){let e=this.getTodayPath(),t=this.app.vault.getAbstractFileByPath(e);if(t instanceof o.TFile)return t;await this.app.vault.create(e,this.createDailyNoteContent(this.today()));let n=this.app.vault.getAbstractFileByPath(e);if(!(n instanceof o.TFile))throw new Error("Failed to create today's LifeOS note.");return n}async updateTodayFields(e){let t=await this.ensureTodayNote(),n=await this.app.vault.read(t);await this.app.vault.modify(t,w(n,e))}async addTodayTask(e){let t=e.trim();if(!t){new o.Notice("\u4EFB\u52A1\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let n=await this.ensureTodayNote(),i=await this.app.vault.read(n),a=g(i,"\u4ECA\u65E5\u91CD\u70B9",`- [ ] ${t}`);await this.app.vault.modify(n,a)}async addQuickNote(e,t="\u5176\u4ED6"){let n=e.trim();if(!n){new o.Notice("\u8BB0\u5F55\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let i=t.trim()||"\u5176\u4ED6";if(new Set(["\u8BB0\u8D26","\u6D88\u8D39","\u8D22\u52A1","\u8D2D\u7269"]).has(i)){await this.appendModuleRecord("06_\u8D22\u52A1\u7BA1\u7406","\u8D22\u52A1\u8BB0\u5F55.md","\u8D22\u52A1\u8BB0\u5F55",this.formatFinanceRecordLine({expense:"",income:"",currency:"\u672A\u8BB0\u5F55",reason:i,note:n}));return"finance"}await this.appendModuleRecord("01_\u6BCF\u65E5\u8BB0\u5F55","\u5FEB\u901F\u8BB0\u5F55.md","\u5FEB\u901F\u8BB0\u5F55",`- ${window.moment().format("YYYY-MM-DD HH:mm")} | ${i} | ${n}`);return"quick"}async addQuickRecordCategory(e){let t=e.trim();if(!t){new o.Notice("\u5206\u7C7B\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}this.settings.quickRecordCategories.includes(t)||(this.settings.quickRecordCategories.push(t),await this.saveSettings())}async addReviewCategory(e){let t=e.trim();if(!t){new o.Notice("\u590D\u76D8\u79CD\u7C7B\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}this.settings.reviewCategories.includes(t)||(this.settings.reviewCategories.push(t),await this.saveSettings())}async addFinanceCurrency(e){let t=e.trim().toUpperCase();if(!t){new o.Notice("\u5E01\u79CD\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}this.settings.financeCurrencies.includes(t)||(this.settings.financeCurrencies.push(t),await this.saveSettings())}async addDailyReview(e){let t=e.trim();if(!t)return;let n=await this.ensureTodayNote(),i=await this.app.vault.read(n),a=g(i,"\u4ECA\u65E5\u590D\u76D8",`- ${t}`);await this.app.vault.modify(n,a)}async createGoal(e){let t=e.title.trim();if(!t){new o.Notice("\u76EE\u6807\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let n=this.databasePath("02_\u76EE\u6807\u7BA1\u7406",`${v(t)}.md`),i=`---
type: goal
title: ${t}
status: \u8FDB\u884C\u4E2D
area: 
deadline: ${e.deadline.trim()}
progress: ${e.progress.trim()||"0"}
priority: ${e.priority.trim()||"P2"}
---

# ${t}

## \u4E3A\u4EC0\u4E48\u91CD\u8981

${e.why.trim()}

## \u6210\u529F\u6807\u51C6


## \u4E0B\u4E00\u6B65\u884C\u52A8

- [ ] 
`;await this.ensureFile(n,i)}async createProject(e){let t=e.title.trim();if(!t){new o.Notice("\u9879\u76EE\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let n=this.databasePath("03_\u4EFB\u52A1\u4E0E\u9879\u76EE",`${v(t)}.md`),i=`---
type: project
title: ${t}
status: \u8FDB\u884C\u4E2D
area: 
deadline: ${e.deadline.trim()}
progress: ${e.progress.trim()||"0"}
---

# ${t}

## \u9879\u76EE\u76EE\u6807

${e.target.trim()}

## \u4EFB\u52A1\u6E05\u5355

- [ ] 

## \u8FDB\u5EA6\u8BB0\u5F55


## \u9879\u76EE\u590D\u76D8

`;await this.ensureFile(n,i)}async createLearningNote(e){let t=e.title.trim();if(!t){new o.Notice("\u5B66\u4E60\u4E3B\u9898\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let n=this.databasePath("04_\u5B66\u4E60\u7CFB\u7EDF",`${v(t)}.md`),i=`---
type: learning_note
title: ${t}
status: \u8FDB\u884C\u4E2D
source: ${e.source.trim()}
created: ${this.today()}
review_count: 0
---

# ${t}

## \u6765\u6E90

${e.source.trim()}

## \u6838\u5FC3\u5185\u5BB9

${e.summary.trim()}

## \u6211\u7684\u7406\u89E3


## \u53EF\u5E94\u7528\u573A\u666F


## \u4E0B\u4E00\u6B65

- [ ] ${e.next.trim()}
`;await this.ensureFile(n,i)}async addHealthRecord(e){let t=await this.ensureTodayNote(),n=await this.app.vault.read(t),i=g(w(n,{sleep:e.sleep.trim(),exercise:e.exercise.trim(),energy:e.energy.trim(),weight:e.weight.trim()}),"\u5065\u5EB7\u8BB0\u5F55",`- \u7761\u7720\uFF1A${e.sleep.trim()||"\u672A\u8BB0\u5F55"}\uFF1B\u8FD0\u52A8\uFF1A${e.exercise.trim()||"\u672A\u8BB0\u5F55"}\uFF1B\u996E\u98DF\uFF1A${e.diet.trim()||"\u672A\u8BB0\u5F55"}\uFF1B\u4F53\u91CD\uFF1A${e.weight.trim()||"\u672A\u8BB0\u5F55"}\uFF1B\u5907\u6CE8\uFF1A${e.note.trim()||"\u65E0"}`);await this.app.vault.modify(t,i)}async addHealthCategoryRecord(e,t,n){let i=t.trim();if(!i){new o.Notice("\u8BB0\u5F55\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let l=`- ${window.moment().format("YYYY-MM-DD HH:mm")} | ${e} | ${i} | ${n.trim()||"\u65E0\u5907\u6CE8"}`;await this.appendModuleRecord("05_\u5065\u5EB7\u7BA1\u7406","\u5065\u5EB7\u8BB0\u5F55.md","\u5065\u5EB7\u8BB0\u5F55",l)}formatFinanceRecordLine(e){return`- ${window.moment().format("YYYY-MM-DD HH:mm")} | \u652F\u51FA\uFF1A${e.expense.trim()||"0"} | \u6536\u5165\uFF1A${e.income.trim()||"0"} | \u5E01\u79CD\uFF1A${e.currency.trim()||"\u672A\u8BB0\u5F55"} | \u539F\u56E0\uFF1A${e.reason.trim()||"\u672A\u8BB0\u5F55"} | \u5907\u6CE8\uFF1A${e.note.trim()||"\u65E0"}`}async addFinanceRecord(e){let t=e.expense.trim(),n=e.income.trim();if(!t&&!n){new o.Notice("\u652F\u51FA\u548C\u6536\u5165\u5C11\u586B\u4E00\u9879\u3002");return}await this.appendModuleRecord("06_\u8D22\u52A1\u7BA1\u7406","\u8D22\u52A1\u8BB0\u5F55.md","\u8D22\u52A1\u8BB0\u5F55",this.formatFinanceRecordLine(e))}extractRecordLines(e){return e.split(`
`).map(t=>t.trim()).filter(t=>t.startsWith("- ")).map(t=>t.replace(/^-\s*/,""))}async migrateLegacyModuleRecords(){let e=[{legacy:["05_\u8D22\u52A1\u4E0E\u6D88\u8D39","\u6D88\u8D39\u8BB0\u5F55.md"],canonical:["06_\u8D22\u52A1\u7BA1\u7406","\u8D22\u52A1\u8BB0\u5F55.md"],title:"\u8D22\u52A1\u8BB0\u5F55"}];for(let t of e){let n=this.databasePath(...t.legacy),i=this.app.vault.getAbstractFileByPath(n);if(!(i instanceof o.TFile))continue;let a=await this.app.vault.read(i),s=this.extractRecordLines(a);if(s.length===0)continue;let r=this.databasePath(...t.canonical);await this.ensureFile(r,`---
type: module_record
title: ${t.title}
updated_at: ${this.today()}
---

# ${t.title}

`);let l=this.app.vault.getAbstractFileByPath(r);if(!(l instanceof o.TFile))continue;let c=await this.app.vault.read(l),u=new Set(this.extractRecordLines(c));for(let p of s)if(!u.has(p)){c=g(w(c,{updated_at:this.today()}),this.today(),`- ${p}`),u.add(p)}await this.app.vault.modify(l,c)}}async migrateLegacyQuickRecords(){let e=this.getQuickRecordPath();await this.ensureFile(e,this.createQuickRecordContent());let t=this.app.vault.getAbstractFileByPath(e);if(!(t instanceof o.TFile))return;let n=await this.app.vault.read(t),i=new Set(this.extractRecordLines(n)),a=this.databasePath("01_\u6BCF\u65E5\u8BB0\u5F55");for(let s of this.app.vault.getMarkdownFiles().filter(r=>r.path.startsWith(`${a}/`)&&r.path!==e))for(let r of M(await this.app.vault.read(s),"\u5FEB\u901F\u8BB0\u5F55"))if(!i.has(r)){n=g(w(n,{updated_at:this.today()}),this.today(),`- ${r}`),i.add(r)}await this.app.vault.modify(t,n)}async appendModuleRecord(e,t,n,i){let a=this.databasePath(e,t);await this.ensureFile(a,`---
type: module_record
title: ${n}
updated_at: ${this.today()}
---

# ${n}

`);let s=this.app.vault.getAbstractFileByPath(a);if(!(s instanceof o.TFile))return;let r=await this.app.vault.read(s),l=this.today(),c=w(r,{updated_at:l}),u=g(c,l,i);await this.app.vault.modify(s,u)}async createRelationship(e){let t=e.name.trim();if(!t){new o.Notice("\u8054\u7CFB\u4EBA\u59D3\u540D\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let n=this.databasePath("07_\u4EBA\u9645\u5173\u7CFB",`${v(t)}.md`),i=`---
type: relationship
name: ${t}
relation: ${e.relation.trim()}
birthday: ${e.birthday.trim()}
city: ${e.city.trim()}
last_contact: ${this.today()}
---

# ${t}

## \u57FA\u672C\u4FE1\u606F

- \u5173\u7CFB\uFF1A${e.relation.trim()}
- \u751F\u65E5\uFF1A${e.birthday.trim()}
- \u57CE\u5E02\uFF1A${e.city.trim()}

## \u91CD\u8981\u4FE1\u606F

- \u559C\u6B22\uFF1A${e.likes.trim()}

## \u6700\u8FD1\u4E92\u52A8

- ${this.today()} \u521B\u5EFA\u8054\u7CFB\u4EBA\u8BB0\u5F55

## \u53EF\u4EE5\u5173\u5FC3\u7684\u4E8B

- [ ] ${e.nextAction.trim()}
`;await this.ensureFile(n,i)}async createReview(e){let t=e.scope.trim();if(!t){new o.Notice("\u8BF7\u9009\u62E9\u590D\u76D8\u79CD\u7C7B\u3002");return}let n=e.content.trim();if(!n){new o.Notice("\u590D\u76D8\u5185\u5BB9\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}let i=this.getReviewPath(t);await this.ensureFile(i,this.createReviewFileContent(t));let a=this.app.vault.getAbstractFileByPath(i);if(!(a instanceof o.TFile))return;let s=await this.app.vault.read(a),r=g(w(s,{updated_at:this.today()}),this.today(),n);await this.app.vault.modify(a,r)}async addEvolutionRequest(e){let t=e.direction.trim();if(!t){new o.Notice("\u8FDB\u5316\u65B9\u5411\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}await this.ensureFile(this.getEvolutionPath(),this.createEvolutionContent());let n=this.app.vault.getAbstractFileByPath(this.getEvolutionPath());if(!(n instanceof o.TFile))throw new Error("Failed to find system evolution file.");let i=await this.app.vault.read(n),s=`### ${window.moment().format("YYYY-MM-DD HH:mm")}

- \u8FDB\u5316\u65B9\u5411\uFF1A${t}
- \u4F7F\u7528\u80CC\u666F\uFF1A${e.context.trim()||"\u672A\u586B\u5199"}
- \u7406\u60F3\u6548\u679C\uFF1A${e.expected.trim()||"\u672A\u586B\u5199"}
`,r=g(w(i,{updated_at:this.today()}),"\u7528\u6237\u63D0\u51FA\u7684\u8FDB\u5316\u65B9\u5411",s);await this.app.vault.modify(n,r)}async addEvolutionIssue(e){let t=e.trim();if(!t){new o.Notice("\u6539\u8FDB\u95EE\u9898\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}await this.ensureFile(this.getEvolutionPath(),this.createEvolutionContent());let n=this.app.vault.getAbstractFileByPath(this.getEvolutionPath());if(!(n instanceof o.TFile))throw new Error("Failed to find system evolution file.");let i=await this.app.vault.read(n),s=`### ${window.moment().format("YYYY-MM-DD HH:mm")}

- \u6539\u8FDB\u95EE\u9898\uFF1A${t}
`,r=g(w(i,{updated_at:this.today()}),"\u7528\u6237\u63D0\u51FA\u7684\u8FDB\u5316\u65B9\u5411",s);await this.app.vault.modify(n,r)}async askAI(e){var r,l,c,u,p,m;let t=e.trim();if(!t)return new o.Notice("AI \u95EE\u9898\u4E0D\u80FD\u4E3A\u7A7A\u3002"),"";if(!this.settings.aiApiKey.trim())return new o.Notice("\u8BF7\u5148\u5728 LifeOS \u8BBE\u7F6E\u91CC\u586B\u5199 AI API Key\u3002"),"";let n=await this.buildAIContext(),i=await(0,o.requestUrl)({url:`${this.settings.aiApiUrl.replace(/\/$/,"")}/v1/chat/completions`,method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.settings.aiApiKey}`},body:JSON.stringify({model:this.settings.aiModel,messages:[{role:"system",content:`${this.settings.aiSystemPrompt}

\u4F60\u5FC5\u987B\u4F18\u5148\u9075\u5B88 LifeOS/12_\u6A21\u677F/AI\u5199\u5165\u89C4\u8303.md\u3002\u7528\u6237\u8981\u6C42\u8BB0\u5F55\u5185\u5BB9\u65F6\uFF0C\u5148\u5224\u65AD\u6240\u5C5E\u6A21\u5757\uFF0C\u518D\u5199\u5230\u5BF9\u5E94\u6A21\u5757\u6587\u4EF6\u5939\uFF0C\u4E0D\u8981\u9ED8\u8BA4\u5199\u8FDB\u6BCF\u65E5\u8BB0\u5F55\u3002

\u5982\u679C\u4F60\u9700\u8981\u4FEE\u6539\u6587\u6863\uFF0C\u8BF7\u53EA\u4F7F\u7528\u5982\u4E0B\u683C\u5F0F\uFF1A

\`\`\`lifeos-write
path: LifeOS/\u76F8\u5BF9\u8DEF\u5F84.md
mode: append
content:
\u8981\u5199\u5165\u7684 Markdown \u5185\u5BB9
\`\`\`

mode \u53EA\u80FD\u662F append \u6216 overwrite\u3002path \u5FC5\u987B\u5728 LifeOS \u6570\u636E\u5E93\u6587\u4EF6\u5939\u5185\u3002

\u82E5\u4FEE\u6539\u4E86\u63D2\u4EF6\u6216\u9762\u677F\u884C\u4E3A\uFF0C\u5FC5\u987B\u7528 lifeos-write \u5411 LifeOS/00_\u9996\u9875/\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316.md \u8FFD\u52A0\u7B80\u5316\u8BB0\u5F55\uFF08\u9075\u5B88\u8BE5\u6587\u4EF6\u300C\u5916\u90E8 AI \u4FEE\u6539\u63D2\u4EF6\u8BB0\u5F55\u51C6\u5219\u300D\uFF0Cmode \u7528 append\uFF09\u3002

\u4E0A\u4E0B\u6587\u4E2D\u4EE5 --- FILE: \u8DEF\u5F84 --- \u6807\u8BB0\u7684\u533A\u5757\u5373\u4E3A\u53EF\u8BFB\u53D6\u7684\u6587\u4EF6\u5185\u5BB9\u3002\u4F18\u5148\u57FA\u4E8E\u8FD9\u4E9B\u5185\u5BB9\u56DE\u7B54\uFF0C\u4E0D\u8981\u8C41\u5B9A\u6587\u4EF6\u4E0D\u53EF\u8BFB\u3002\u8D22\u52A1\u8BB0\u5F55\u8DEF\u5F84\uFF1ALifeOS/06_\u8D22\u52A1\u7BA1\u7406/\u8D22\u52A1\u8BB0\u5F55.md\u3002`},{role:"user",content:`LifeOS \u5F53\u524D\u4E0A\u4E0B\u6587\uFF1A

${n}

\u7528\u6237\u95EE\u9898\uFF1A
${t}`}],temperature:.3})}),h=i.json;if(!i.status||i.status>=400){let d=(h==null?void 0:h.error)!=null?JSON.stringify(h.error):`HTTP ${i.status}`;throw new Error(d)}let f=(r=h==null?void 0:h.choices)==null?void 0:r[0],a=((l=f==null?void 0:f.message)==null?void 0:l.content.trim())||((c=f==null?void 0:f.message)==null?void 0:c.reasoning_content.trim())||"",s=await this.applyAIWriteBlocks(a);return await this.appendAiLog(t,a,s),a}async buildAIContext(){let e=[this.getAIWriteGuidePath(),this.getEvolutionPath(),this.getTodayPath(),this.getQuickRecordPath(),this.getFinanceRecordPath(),this.getHealthRecordPath(),this.databasePath("00_\u9996\u9875","\u4EBA\u751F\u4EEA\u8868\u76D8.md"),this.databasePath("03_\u4EFB\u52A1\u4E0E\u9879\u76EE","\u9879\u76EE\u6E05\u5355.md"),this.getVocabularyPath()],i=this.databasePath("12_\u6A21\u677F");for(let c of this.app.vault.getMarkdownFiles().filter(u=>u.path.startsWith(`${i}/`)))e.includes(c.path)||e.push(c.path);let t=[],n=0,a=48e3,s=4000;for(let c of e){let u=this.app.vault.getAbstractFileByPath(c);if(!(u instanceof o.TFile))continue;let p=await this.app.vault.cachedRead(u),m=`--- FILE: ${c} ---
${p.slice(0,s)}`;if(n+m.length>a)break;t.push(m),n+=m.length}let r=new Set(e);for(let c of this.getDatabaseFiles()){if(r.has(c.path))continue;let u=await this.app.vault.cachedRead(c),p=`--- FILE: ${c.path} ---
${u.slice(0,2000)}`;if(n+p.length>a-500)break;t.push(p),n+=p.length,r.add(c.path)}let l=this.getDatabaseFiles().map(c=>`- ${c.path}`).join(`
`);return t.push(`--- LIFEOS FILE INDEX (${this.getDatabaseFiles().length} markdown files) ---
${l}`),t.join(`

`).slice(0,a)}async applyAIWriteBlocks(e){let t=[],n=/```lifeos-write\s*\n([\s\S]*?)```/g,i;for(;(i=n.exec(e))!==null;){let a=i[1],s=O(a);if(!s){t.push("\u8DF3\u8FC7\uFF1A\u5199\u5165\u5757\u683C\u5F0F\u65E0\u6548");continue}let r=(0,o.normalizePath)(s.path),l=this.databasePath();if(!r.startsWith(`${l}/`)){t.push(`\u62D2\u7EDD\uFF1A${r} \u4E0D\u5728 ${l}/ \u5185`);continue}await this.ensureParentFolder(r);let c=this.app.vault.getAbstractFileByPath(r);if(c instanceof o.TFile)if(s.mode==="overwrite")await this.app.vault.modify(c,s.content);else{let u=await this.app.vault.read(c);await this.app.vault.modify(c,`${u.trimEnd()}

${s.content.trim()}
`)}else await this.app.vault.create(r,`${s.content.trim()}
`);t.push(`\u5DF2\u5199\u5165\uFF1A${r} (${s.mode})`)}return t}async ensureParentFolder(e){let t=(0,o.normalizePath)(e).split("/");t.pop();let n="";for(let i of t)n=n?`${n}/${i}`:i,await this.ensureFolder(n)}async appendAiLog(e,t,n){await this.ensureFile(this.getAiLogPath(),this.createAiLogContent());let i=this.app.vault.getAbstractFileByPath(this.getAiLogPath());if(!(i instanceof o.TFile))return;let a=await this.app.vault.read(i),r=`## ${window.moment().format("YYYY-MM-DD HH:mm")}

### \u7528\u6237

${e.trim()}

### AI

${t.trim()||"\u65E0\u56DE\u7B54"}

### \u5199\u5165\u7ED3\u679C

${n.length?n.map(l=>`- ${l}`).join(`
`):"- \u65E0\u6587\u6863\u5199\u5165"}
`;await this.app.vault.modify(i,`${a.trimEnd()}

${r}`)}getDatabaseFiles(){let e=this.databasePath();return this.app.vault.getMarkdownFiles().filter(t=>t.path===e||t.path.startsWith(`${e}/`))}async getOpenTasks(e=12){let t=[];for(let n of this.getDatabaseFiles()){let i=await this.app.vault.cachedRead(n);if(this.shouldSkipTaskScan(n,i))continue;i.split(`
`).forEach((s,r)=>{let l=s.match(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/);if(!l)return;let c=l[1].toLowerCase()==="x";!c&&l[2].trim()&&t.push({file:n,line:r,text:l[2],completed:c})})}return t.slice(0,e)}async getCompletedTasks(e=12){let t=[];for(let n of this.getDatabaseFiles()){let i=await this.app.vault.cachedRead(n);if(this.shouldSkipTaskScan(n,i))continue;i.split(`
`).forEach((s,r)=>{let l=s.match(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/);if(!l)return;let c=l[1].toLowerCase()==="x";c&&l[2].trim()&&t.push({file:n,line:r,text:l[2],completed:c})})}return t.slice(0,e)}shouldSkipTaskScan(e,t){let n=x(t);return new Set(["vocabulary_flashcards","ai_chat_log","system_evolution","system_config"]).has(n.type)?!0:new Set([this.getVocabularyPath(),this.getAiLogPath(),this.getEvolutionPath(),this.databasePath("system.config.md")]).has(e.path)}async toggleTask(e){let n=(await this.app.vault.read(e.file)).split(`
`),i=n[e.line];if(!i){new o.Notice("\u6CA1\u6709\u627E\u5230\u8FD9\u6761\u4EFB\u52A1\u3002");return}n[e.line]=i.replace(/-\s+\[[ xX]\]/,e.completed?"- [ ]":"- [x]"),await this.app.vault.modify(e.file,n.join(`
`))}async getItems(e,t,n=6){var r,l;let i=this.databasePath(e),a=this.app.vault.getMarkdownFiles().filter(c=>c.path.startsWith(`${i}/`)),s=[];for(let c of a){let u=await this.app.vault.cachedRead(c),p=x(u);if(p.type&&p.type!==t&&t!=="any")continue;let m=(r=p.status)!=null?r:"\u672A\u8BBE\u7F6E";m==="\u5DF2\u5B8C\u6210"||m==="\u5F52\u6863"||s.push({file:c,title:(l=p.title)!=null?l:c.basename,status:m,progress:_(p.progress)})}return s.slice(0,n)}async addVocabularyCard(e){let t=e.word.trim(),n=e.meaning.trim();if(!t||!n){new o.Notice("\u5355\u8BCD\u548C\u91CA\u4E49\u4E0D\u80FD\u4E3A\u7A7A\u3002");return}await this.ensureFolder(this.databasePath("04_\u5B66\u4E60\u7CFB\u7EDF","\u82F1\u8BED")),await this.ensureFile(this.getVocabularyPath(),this.createVocabularyContent());let i=this.app.vault.getAbstractFileByPath(this.getVocabularyPath());if(!(i instanceof o.TFile))throw new Error("Failed to find vocabulary file.");let a=await this.app.vault.read(i),s=g(w(a,{updated_at:this.today()}),"\u5355\u8BCD\u5217\u8868",`- [ ] ${t} :: ${n} :: ${e.example.trim()}`);await this.app.vault.modify(i,s)}async getVocabularyCards(e=20){await this.ensureFolder(this.databasePath("04_\u5B66\u4E60\u7CFB\u7EDF","\u82F1\u8BED")),await this.ensureFile(this.getVocabularyPath(),this.createVocabularyContent());let t=this.app.vault.getAbstractFileByPath(this.getVocabularyPath());if(!(t instanceof o.TFile))return[];let n=await this.app.vault.cachedRead(t),i=[];return n.split(`
`).forEach((a,s)=>{let r=a.match(/^\s*-\s+\[([ xX])\]\s+(.+?)\s*::\s*(.*?)\s*(?:::|$)\s*(.*?)\s*$/);r&&i.push({file:t,line:s,word:r[2].trim(),meaning:r[3].trim(),example:r[4].trim(),completed:r[1].toLowerCase()==="x"})}),i.slice(0,e)}async getTodayPreviewData(){let e=await this.ensureTodayNote(),t=await this.app.vault.cachedRead(e),n=x(t);return{mood:n.mood||"",energy:n.energy||"",sleep:n.sleep||"",exercise:n.exercise||"",file:e,reviewLines:M(t,"\u4ECA\u65E5\u590D\u76D8")}}extractReviewSections(e){let t=[],n=e.split(/\n(?=## )/);for(let i of n){let a=i.match(/^## (.+?)\s*\n([\s\S]*)$/);a&&t.push({date:a[1].trim(),text:a[2].trim()})}return t.filter(i=>i.text)}async getEvolutionPreviewSections(){let e=this.app.vault.getAbstractFileByPath(this.getEvolutionPath());if(!(e instanceof o.TFile))return[];let t=await this.app.vault.cachedRead(e);return["\u81EA\u9002\u5E94\u8FDB\u5316\u8FC7\u7A0B","\u7528\u6237\u63D0\u51FA\u7684\u8FDB\u5316\u65B9\u5411","\u5DF2\u5B8C\u6210\u4FEE\u6539\u8BB0\u5F55"].map(n=>({title:n,lines:N(t,n)})).filter(n=>n.lines.length>0)}async getEvolutionSnippets(e=10){let t=this.app.vault.getAbstractFileByPath(this.getEvolutionPath());if(!(t instanceof o.TFile))return[];let n=await this.app.vault.cachedRead(t);return n.split(`
`).filter(i=>i.startsWith("### ")).slice(-e).map(i=>i.replace(/^###\s*/,"").trim())}},b=class extends o.Modal{constructor(e,t){super(e);this.panel="home";this.panelHistory=[];this.expanded=!1;this.evolutionDraft="";this.aiDraft="";this.aiAnswerText="";this.aiAnswerVisible=!1;this.previewTarget="tasks";this.previewReviewScope="";this.plugin=t}onOpen(){this.modalEl.addClass("lifeos-floating-modal"),this.render()}onClose(){this.plugin.modal=null,this.contentEl.empty()}async render(){this.contentEl.empty(),this.modalEl.toggleClass("lifeos-expanded",this.expanded);let e=this.contentEl.createDiv({cls:"lifeos-shell"});this.renderHeader(e);let t=e.createDiv({cls:"lifeos-content-layout"}),n=t.createDiv({cls:"lifeos-body"});this.renderEvolutionSidebar(t),this.panel==="home"?await this.renderHome(n):this.panel==="today"?await this.renderTodayForm(n):this.panel==="task"?await this.renderTaskPanel(n):this.panel==="quick"?this.renderQuickPanel(n):this.panel==="goal"?this.renderGoalPanel(n):this.panel==="project"?this.renderProjectPanel(n):this.panel==="learning"?this.renderLearningPanel(n):this.panel==="learningNote"?this.renderLearningNotePanel(n):this.panel==="english"?await this.renderEnglishPanel(n):this.panel==="health"?this.renderHealthPanel(n):this.panel==="healthSleep"?this.renderHealthCategoryPanel(n,"\u7761\u7720","\u4F8B\u5982\uFF1A7.5\u5C0F\u65F6\uFF0C23:30\u5165\u7761\uFF0C07:00\u9192\u6765"):this.panel==="healthExercise"?this.renderHealthCategoryPanel(n,"\u8FD0\u52A8","\u4F8B\u5982\uFF1A\u8DD1\u6B6530\u5206\u949F\uFF0C\u529B\u91CF\u8BAD\u7EC345\u5206\u949F"):this.panel==="healthDiet"?this.renderHealthCategoryPanel(n,"\u996E\u98DF","\u4F8B\u5982\uFF1A\u65E9\u9910\u6B63\u5E38\uFF0C\u665A\u9910\u504F\u6CB9\uFF0C\u559D\u6C34\u8F83\u5C11"):this.panel==="healthEnergy"?this.renderHealthCategoryPanel(n,"\u7CBE\u529B","\u4F8B\u5982\uFF1A7/10\uFF0C\u4E0B\u5348\u660E\u663E\u72AF\u56F0"):this.panel==="healthWeight"?this.renderHealthCategoryPanel(n,"\u4F53\u91CD","\u4F8B\u5982\uFF1A68.5kg"):this.panel==="finance"?this.renderFinancePanel(n):this.panel==="relationship"?this.renderRelationshipPanel(n):this.panel==="review"?this.renderReviewPanel(n):this.panel==="database"?this.renderDatabasePanel(n):this.panel==="previewDetail"?await this.renderPreviewDetailPanel(n):this.panel==="previewSettings"?this.renderPreviewSettingsPanel(n):this.panel==="evolution"&&this.renderEvolutionPanel(n)}renderEvolutionSidebar(e){let t=e.createDiv({cls:"lifeos-evolution-sidebar"});t.createEl("h3",{text:"\u7CFB\u7EDF\u8FDB\u5316"}),t.createEl("p",{text:"\u968F\u65F6\u8BB0\u5F55\u8FD9\u4E2A\u9762\u677F\u54EA\u91CC\u4E0D\u597D\u7528\u3001\u60F3\u65B0\u589E\u4EC0\u4E48\u3001\u5E0C\u671B\u5916\u90E8 AI \u600E\u4E48\u7EE7\u7EED\u6539\u3002",cls:"lifeos-sidebar-desc"});let n=t.createEl("textarea",{cls:"lifeos-evolution-input",placeholder:"\u8F93\u5165\u9700\u8981\u6539\u8FDB\u7684\u95EE\u9898..."});n.value=this.evolutionDraft,n.addEventListener("input",()=>{this.evolutionDraft=n.value});let i=t.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(i).setButtonText("\u4FDD\u5B58").setCta().onClick(async()=>{await this.plugin.addEvolutionIssue(n.value),n.value="",this.evolutionDraft="",new o.Notice("\u6539\u8FDB\u95EE\u9898\u5DF2\u5199\u5165\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316\u6587\u4EF6\u3002")}),new o.ButtonComponent(i).setButtonText("\u8BF4\u660E").onClick(()=>{this.navigate("evolution"),this.render()});let a=t.createDiv({cls:"lifeos-ai-section"});a.createDiv({cls:"lifeos-sidebar-divider"}),a.createEl("h3",{text:"AI \u95EE\u7B54"}),a.createEl("p",{text:"AI \u4F1A\u8BFB\u53D6 LifeOS \u4E0A\u4E0B\u6587\u3002\u82E5\u56DE\u7B54\u5305\u542B\u53D7\u63A7\u5199\u5165\u5757\uFF0C\u63D2\u4EF6\u4F1A\u53EA\u5728 LifeOS \u6587\u4EF6\u5939\u5185\u4FEE\u6539 Markdown\u3002",cls:"lifeos-sidebar-desc"});let s=a.createEl("textarea",{cls:"lifeos-ai-input",placeholder:"\u95EE AI\uFF0C\u6216\u8BA9\u5B83\u4FEE\u6539 LifeOS \u6587\u6863..."});s.value=this.aiDraft,s.addEventListener("input",()=>{this.aiDraft=s.value});let r=a.createDiv({cls:"lifeos-actions lifeos-ai-actions"}),l=a.createDiv({cls:"lifeos-ai-answer"});this.aiAnswerVisible?(l.show(),l.setText(this.aiAnswerText)):l.hide(),new o.ButtonComponent(r).setButtonText("\u53D1\u9001").setCta().onClick(async()=>{this.aiAnswerVisible=!0,this.aiAnswerText="\u6B63\u5728\u601D\u8003...",l.show(),l.setText(this.aiAnswerText);try{let c=await this.plugin.askAI(s.value);this.aiAnswerText=c||"\u6CA1\u6709\u6536\u5230\u56DE\u7B54\u3002",l.setText(this.aiAnswerText),s.value="",this.aiDraft=""}catch(c){let u=c instanceof Error?c.message:String(c);this.aiAnswerText=`\u8BF7\u6C42\u5931\u8D25\uFF1A${u}`,l.setText(this.aiAnswerText),new o.Notice("AI \u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 API \u8BBE\u7F6E\u3002")}}),new o.ButtonComponent(r).setButtonText("\u8BB0\u5F55").onClick(async()=>{let c=this.plugin.app.vault.getAbstractFileByPath(this.plugin.getAiLogPath());c instanceof o.TFile&&(this.close(),await this.plugin.app.workspace.getLeaf(!0).openFile(c))})}renderHeader(e){let t=e.createDiv({cls:"lifeos-panel-header"}),n=t.createDiv({cls:"lifeos-panel-left"});this.panel!=="home"&&new o.ButtonComponent(n).setIcon("arrow-left").setTooltip("\u8FD4\u56DE\u4E0A\u4E00\u7EA7").onClick(()=>{this.goBack(),this.render()}),n.createEl("h2",{text:this.getTitle(),cls:"lifeos-panel-title"});let i=t.createDiv({cls:"lifeos-panel-actions"});new o.ButtonComponent(i).setIcon(this.expanded?"minimize-2":"maximize-2").setTooltip(this.expanded?"\u7F29\u5C0F\u9762\u677F":"\u6269\u5927\u9762\u677F").onClick(()=>{this.expanded=!this.expanded,this.render()}),new o.ButtonComponent(i).setButtonText("\xD7").setTooltip("\u5173\u95ED").onClick(()=>this.close())}navigate(e){e!==this.panel&&(this.panelHistory.push(this.panel),this.panel=e)}goBack(){if(this.panel==="previewDetail"&&this.previewTarget==="reviewItem"){this.previewTarget="reviews";return}var e;this.panel=(e=this.panelHistory.pop())!=null?e:"home"}getTitle(){return{home:"LifeOS",today:"\u4ECA\u65E5\u586B\u5199",task:"\u4EFB\u52A1\u9762\u677F",quick:"\u5FEB\u901F\u8BB0\u5F55",goal:"\u65B0\u5EFA\u76EE\u6807",project:"\u65B0\u5EFA\u9879\u76EE",learning:"\u5B66\u4E60\u8BB0\u5F55",learningNote:"\u901A\u7528\u5B66\u4E60\u7B14\u8BB0",english:"\u82F1\u8BED\u5B66\u4E60",health:"\u5065\u5EB7\u8BB0\u5F55",healthSleep:"\u7761\u7720\u8BB0\u5F55",healthExercise:"\u8FD0\u52A8\u8BB0\u5F55",healthDiet:"\u996E\u98DF\u8BB0\u5F55",healthEnergy:"\u7CBE\u529B\u8BB0\u5F55",healthWeight:"\u4F53\u91CD\u8BB0\u5F55",finance:"\u8D22\u52A1\u8BB0\u5F55",relationship:"\u4EBA\u9645\u5173\u7CFB",review:"\u590D\u76D8",database:"\u6570\u636E\u5E93",previewDetail:"\u9884\u89C8",previewSettings:"\u9884\u89C8\u8BBE\u7F6E",evolution:"\u7CFB\u7EDF\u8FDB\u5316"}[this.panel]}async renderHome(e){e.createEl("p",{text:`${this.plugin.today()} \xB7 \u6570\u636E\u5E93\uFF1A${this.plugin.settings.databaseFolder}`,cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-nav-grid"});this.addNavButton(t,"\u4ECA\u65E5\u586B\u5199","\u586B\u5199\u60C5\u7EEA\u3001\u7CBE\u529B\u3001\u7761\u7720\u548C\u590D\u76D8","today"),this.addNavButton(t,"\u4EFB\u52A1","\u6DFB\u52A0\u4EFB\u52A1\uFF0C\u52FE\u9009\u5B8C\u6210","task"),this.addNavButton(t,"\u5FEB\u901F\u8BB0\u5F55","\u6355\u6349\u60F3\u6CD5\u3001\u5B66\u4E60\u3001\u6D88\u8D39\u548C\u7075\u611F","quick"),this.addNavButton(t,"\u76EE\u6807","\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u76EE\u6807\u6587\u4EF6","goal"),this.addNavButton(t,"\u9879\u76EE","\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u9879\u76EE\u6587\u4EF6","project"),this.addNavButton(t,"\u5B66\u4E60","\u9009\u62E9\u5B66\u79D1\u548C\u5B66\u4E60\u65B9\u5F0F","learning"),this.addNavButton(t,"\u5065\u5EB7","\u6309\u7C7B\u578B\u8BB0\u5F55\u8EAB\u4F53\u72B6\u6001","health"),this.addNavButton(t,"\u8D22\u52A1","\u8BB0\u5F55\u652F\u51FA\u3001\u6536\u5165\u3001\u5E01\u79CD\u548C\u539F\u56E0","finance"),this.addNavButton(t,"\u4EBA\u9645","\u521B\u5EFA\u8054\u7CFB\u4EBA\u548C\u7EF4\u62A4\u63D0\u9192","relationship"),this.addNavButton(t,"\u590D\u76D8","\u9009\u62E9\u79CD\u7C7B\uFF0C\u5199\u4E0B\u590D\u76D8\u5185\u5BB9","review"),this.addNavButton(t,"\u6570\u636E\u5E93","\u67E5\u770B\u7CFB\u7EDF\u8FB9\u754C\u548C\u6587\u4EF6\u7EDF\u8BA1","database"),this.addNavButton(t,"\u9884\u89C8\u8BBE\u7F6E","\u589E\u51CF\u4E3B\u9762\u677F\u4E0B\u65B9\u7684\u9884\u89C8\u5361\u7247","previewSettings"),this.addNavButton(t,"\u7CFB\u7EDF\u8FDB\u5316","\u7ED9\u5916\u90E8 AI \u770B\u7684\u9700\u6C42\u548C\u6F14\u5316\u8BB0\u5F55","evolution");let n=e.createDiv({cls:"lifeos-grid"});await this.renderHomePreviews(n)}addNavButton(e,t,n,i){let a=e.createEl("button",{cls:"lifeos-nav-button"});a.createSpan({text:t,cls:"lifeos-nav-title"}),a.createSpan({text:n,cls:"lifeos-nav-desc"}),a.addEventListener("click",()=>{this.navigate(i),this.render()})}async renderHomePreviews(e){let t=new Set(this.plugin.settings.homePreviewPanels),n=[{id:"tasks",render:()=>this.renderTasksPreview(e)},{id:"today",render:async()=>await this.renderTodayPreview(e)},{id:"quick",render:async()=>await this.renderModuleRecordCardPreview(e,"\u5FEB\u901F\u8BB0\u5F55","01_\u6BCF\u65E5\u8BB0\u5F55","\u5FEB\u901F\u8BB0\u5F55.md","quick")},{id:"goals",render:()=>this.renderItemsPreview(e,"\u76EE\u6807","02_\u76EE\u6807\u7BA1\u7406","goal","goals")},{id:"projects",render:()=>this.renderItemsPreview(e,"\u9879\u76EE","03_\u4EFB\u52A1\u4E0E\u9879\u76EE","any","projects")},{id:"learning",render:async()=>await this.renderLearningPreview(e)},{id:"relationships",render:()=>this.renderItemsPreview(e,"\u4EBA\u9645","07_\u4EBA\u9645\u5173\u7CFB","relationship","relationships")},{id:"health",render:async()=>await this.renderModuleRecordCardPreview(e,"\u5065\u5EB7","05_\u5065\u5EB7\u7BA1\u7406","\u5065\u5EB7\u8BB0\u5F55.md","health")},{id:"finance",render:async()=>await this.renderModuleRecordCardPreview(e,"\u8D22\u52A1","06_\u8D22\u52A1\u7BA1\u7406","\u8D22\u52A1\u8BB0\u5F55.md","finance")},{id:"reviews",render:async()=>await this.renderReviewsPreview(e)},{id:"database",render:async()=>await this.renderDatabasePreview(e)},{id:"evolution",render:async()=>await this.renderEvolutionPreview(e)}];for(let i of n)t.has(i.id)&&await i.render()}navigatePreview(e){this.previewTarget=e,this.panel!=="previewDetail"&&this.navigate("previewDetail")}async renderTodayForm(e){var c,u,p,m;let t=await this.plugin.ensureTodayNote(),n=x(await this.plugin.app.vault.cachedRead(t)),i=this.addInput(e,"\u4ECA\u65E5\u60C5\u7EEA",(c=n.mood)!=null?c:"","\u4F8B\u5982\uFF1A\u5E73\u9759\u3001\u6709\u538B\u529B\u3001\u5F00\u5FC3"),a=this.addInput(e,"\u7CBE\u529B\u8BC4\u5206",(u=n.energy)!=null?u:"","0-10"),s=this.addInput(e,"\u7761\u7720\u65F6\u95F4",(p=n.sleep)!=null?p:"","\u4F8B\u5982\uFF1A7.5"),r=this.addInput(e,"\u662F\u5426\u8FD0\u52A8",(m=n.exercise)!=null?m:"false","true / false"),l=this.addTextarea(e,"\u4ECA\u65E5\u590D\u76D8","\u5199\u51E0\u53E5\u4ECA\u5929\u7684\u590D\u76D8");this.addSubmit(e,"\u4FDD\u5B58\u4ECA\u65E5\u586B\u5199",async()=>{await this.plugin.updateTodayFields({mood:i.value,energy:a.value,sleep:s.value,exercise:r.value}),await this.plugin.addDailyReview(l.value),new o.Notice("\u5DF2\u5199\u5165\u4ECA\u65E5\u8BB0\u5F55\u3002"),this.goBack(),await this.render()})}async renderTaskPanel(e){let t=this.addInput(e,"\u65B0\u589E\u4EFB\u52A1","","\u8F93\u5165\u4EFB\u52A1\u5185\u5BB9");this.addSubmit(e,"\u6DFB\u52A0\u4EFB\u52A1",async()=>{await this.plugin.addTodayTask(t.value),t.value="",await this.render()}),e.createEl("h3",{text:"\u672A\u5B8C\u6210\u4EFB\u52A1"});let n=await this.plugin.getOpenTasks(30),i=e.createEl("ul",{cls:"lifeos-card-list"});n.length===0&&i.createEl("li",{text:"\u6CA1\u6709\u672A\u5B8C\u6210\u4EFB\u52A1\u3002",cls:"lifeos-empty"});for(let r of n){let l=i.createEl("li",{cls:"lifeos-task"});l.createEl("input",{type:"checkbox"}).addEventListener("change",async()=>{await this.plugin.toggleTask(r),await this.render()}),l.createSpan({text:r.text})}e.createEl("h3",{text:"\u5DF2\u5B8C\u6210\u4EFB\u52A1"});let a=await this.plugin.getCompletedTasks(30),s=e.createEl("ul",{cls:"lifeos-card-list"});a.length===0&&s.createEl("li",{text:"\u6682\u65E0\u5DF2\u5B8C\u6210\u4EFB\u52A1\u3002",cls:"lifeos-empty"});for(let r of a){let l=s.createEl("li",{cls:"lifeos-task lifeos-task-completed"}),c=l.createEl("input",{type:"checkbox"});c.checked=!0,c.addEventListener("change",async()=>{await this.plugin.toggleTask(r),await this.render()}),l.createSpan({text:r.text})}}renderQuickPanel(e){e.createEl("p",{text:`\u8BB0\u5F55\u5199\u5165 ${this.plugin.getQuickRecordPath()}。批量导入请参考 ${this.plugin.databasePath("12_\u6A21\u677F","AI\u6A21\u677F-\u5FEB\u901F\u8BB0\u5F55.md")}。`,cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-field-wrap"});t.createEl("label",{text:"\u8BB0\u5F55\u5206\u7C7B"});let n=t.createEl("select",{cls:"lifeos-field"});for(let r of this.plugin.settings.quickRecordCategories)n.createEl("option",{text:r,value:r});let i=this.addInput(e,"\u65B0\u589E\u5206\u7C7B","","\u4F8B\u5982\uFF1A\u7075\u611F\u3001\u590D\u76D8\u3001\u8D2D\u7269\u6E05\u5355"),a=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(a).setButtonText("\u6DFB\u52A0\u5206\u7C7B").onClick(async()=>{await this.plugin.addQuickRecordCategory(i.value),new o.Notice("\u5206\u7C7B\u5DF2\u6DFB\u52A0\u3002"),await this.render()}),new o.ButtonComponent(a).setButtonText("\u6253\u5F00\u5FEB\u901F\u8BB0\u5F55").onClick(async()=>{await this.plugin.ensureFile(this.plugin.getQuickRecordPath(),this.plugin.createQuickRecordContent());let r=this.plugin.app.vault.getAbstractFileByPath(this.plugin.getQuickRecordPath());r instanceof o.TFile&&(this.close(),await this.plugin.app.workspace.getLeaf(!0).openFile(r))});let s=this.addTextarea(e,"\u5FEB\u901F\u8BB0\u5F55","\u5199\u4E0B\u60F3\u6CD5\u3001\u5B66\u4E60\u6536\u83B7\u3001\u7075\u611F\u6216\u4E34\u65F6\u8BB0\u5F55");this.addSubmit(e,"\u5199\u5165\u5FEB\u901F\u8BB0\u5F55",async()=>{let c=await this.plugin.addQuickNote(s.value,n.value);new o.Notice(c==="finance"?"\u5DF2\u5199\u5165\u8D22\u52A1\u8BB0\u5F55\u3002":"\u5DF2\u5199\u5165\u5FEB\u901F\u8BB0\u5F55\u3002"),this.goBack(),await this.render()})}renderGoalPanel(e){let t=this.addInput(e,"\u76EE\u6807\u540D\u79F0","","\u4F8B\u5982\uFF1A\u63D0\u5347\u82F1\u8BED\u80FD\u529B"),n=this.addTextarea(e,"\u4E3A\u4EC0\u4E48\u91CD\u8981","\u5199\u4E0B\u8FD9\u4E2A\u76EE\u6807\u548C\u4F60\u7684\u5173\u7CFB"),i=this.addInput(e,"\u622A\u6B62\u65E5\u671F","","YYYY-MM-DD"),a=this.addInput(e,"\u5F53\u524D\u8FDB\u5EA6","0","0-100"),s=this.addInput(e,"\u4F18\u5148\u7EA7","P2","P1 / P2 / P3");this.addSubmit(e,"\u521B\u5EFA\u76EE\u6807",async()=>{await this.plugin.createGoal({title:t.value,why:n.value,deadline:i.value,progress:a.value,priority:s.value}),new o.Notice("\u76EE\u6807\u5DF2\u521B\u5EFA\u3002"),this.goBack(),await this.render()})}renderProjectPanel(e){let t=this.addInput(e,"\u9879\u76EE\u540D\u79F0","","\u4F8B\u5982\uFF1A\u642D\u5EFA LifeOS \u63D2\u4EF6"),n=this.addTextarea(e,"\u9879\u76EE\u76EE\u6807","\u8FD9\u4E2A\u9879\u76EE\u5B8C\u6210\u65F6\u5E94\u8BE5\u662F\u4EC0\u4E48\u6837\u5B50"),i=this.addInput(e,"\u622A\u6B62\u65E5\u671F","","YYYY-MM-DD"),a=this.addInput(e,"\u5F53\u524D\u8FDB\u5EA6","0","0-100");this.addSubmit(e,"\u521B\u5EFA\u9879\u76EE",async()=>{await this.plugin.createProject({title:t.value,target:n.value,deadline:i.value,progress:a.value}),new o.Notice("\u9879\u76EE\u5DF2\u521B\u5EFA\u3002"),this.goBack(),await this.render()})}renderLearningPanel(e){e.createEl("p",{text:"\u4E0D\u540C\u5B66\u79D1\u4F1A\u6709\u4E0D\u540C\u5B66\u4E60\u65B9\u5F0F\u3002\u5F53\u524D\u5148\u63D0\u4F9B\u901A\u7528\u5B66\u4E60\u7B14\u8BB0\u548C\u82F1\u8BED\u80CC\u5355\u8BCD\u3002",cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-nav-grid"});this.addNavButton(t,"\u901A\u7528\u7B14\u8BB0","\u8BFE\u7A0B\u3001\u8BFB\u4E66\u3001\u6587\u7AE0\u548C\u77E5\u8BC6\u6574\u7406","learningNote"),this.addNavButton(t,"\u82F1\u8BED","\u5355\u8BCD\u95EA\u5361\u548C\u82F1\u8BED\u5B66\u4E60\u8BB0\u5F55","english")}renderLearningNotePanel(e){let t=this.addInput(e,"\u5B66\u4E60\u4E3B\u9898","","\u4F8B\u5982\uFF1A\u6DF1\u5EA6\u5DE5\u4F5C\u3001TypeScript\u3001\u82F1\u8BED\u542C\u529B"),n=this.addInput(e,"\u6765\u6E90","","\u4E66\u7C4D\u3001\u8BFE\u7A0B\u3001\u6587\u7AE0\u6216\u94FE\u63A5"),i=this.addTextarea(e,"\u6838\u5FC3\u5185\u5BB9","\u8FD9\u6B21\u5B66\u4E60\u6700\u91CD\u8981\u7684\u5185\u5BB9\u662F\u4EC0\u4E48"),a=this.addInput(e,"\u4E0B\u4E00\u6B65","","\u4E0B\u4E00\u6B21\u8981\u505A\u7684\u7EC3\u4E60\u6216\u590D\u4E60");this.addSubmit(e,"\u521B\u5EFA\u5B66\u4E60\u7B14\u8BB0",async()=>{await this.plugin.createLearningNote({title:t.value,source:n.value,summary:i.value,next:a.value}),new o.Notice("\u5B66\u4E60\u7B14\u8BB0\u5DF2\u521B\u5EFA\u3002"),this.goBack(),await this.render()})}async renderEnglishPanel(e){e.createEl("p",{text:"\u5355\u8BCD\u4F1A\u4FDD\u5B58\u5230 LifeOS/04_\u5B66\u4E60\u7CFB\u7EDF/\u82F1\u8BED/\u5355\u8BCD\u95EA\u5361.md\u3002\u4F60\u4E5F\u53EF\u4EE5\u8BA9\u5916\u90E8 AI \u6309 \u201C- [ ] word :: meaning :: example\u201D \u7684\u683C\u5F0F\u6279\u91CF\u52A0\u5165\u3002",cls:"lifeos-subtitle"});let t=this.addInput(e,"\u5355\u8BCD","","example"),n=this.addInput(e,"\u91CA\u4E49","","\u4F8B\u5B50\uFF1B\u793A\u4F8B"),i=this.addTextarea(e,"\u4F8B\u53E5","This is an example sentence.");this.addSubmit(e,"\u52A0\u5165\u5355\u8BCD\u95EA\u5361",async()=>{await this.plugin.addVocabularyCard({word:t.value,meaning:n.value,example:i.value}),new o.Notice("\u5355\u8BCD\u5DF2\u52A0\u5165\u95EA\u5361\u3002"),await this.render()});e.createEl("p",{text:"\u70B9\u51FB\u5361\u7247\u67E5\u770B\u91CA\u4E49\u548C\u4F8B\u53E5\u3002",cls:"lifeos-subtitle"});let a=await this.plugin.getVocabularyCards(30),s=e.createDiv({cls:"lifeos-flashcard-grid lifeos-flashcard-grid-flip"});for(let r of a)this.createFlipFlashcard(s,r)}renderHealthPanel(e){e.createEl("p",{text:"\u5065\u5EB7\u4E0D\u8981\u6C42\u6BCF\u5929\u8BB0\u5F55\uFF0C\u60F3\u8D77\u6765\u5C31\u6309\u7C7B\u578B\u8BB0\u5F55\u4E00\u6B21\u3002\u6BCF\u6761\u8BB0\u5F55\u90FD\u4F1A\u81EA\u52A8\u5E26\u5B8C\u6574\u65F6\u95F4\u3002",cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-nav-grid"});this.addNavButton(t,"\u7761\u7720","\u8BB0\u5F55\u5165\u7761\u3001\u8D77\u5E8A\u3001\u65F6\u957F\u548C\u8D28\u91CF","healthSleep"),this.addNavButton(t,"\u8FD0\u52A8","\u8BB0\u5F55\u8FD0\u52A8\u7C7B\u578B\u3001\u65F6\u957F\u548C\u5F3A\u5EA6","healthExercise"),this.addNavButton(t,"\u996E\u98DF","\u8BB0\u5F55\u996E\u98DF\u72B6\u6001\u548C\u7279\u6B8A\u6444\u5165","healthDiet"),this.addNavButton(t,"\u7CBE\u529B","\u8BB0\u5F55\u5F53\u4E0B\u7CBE\u529B\u8BC4\u5206\u548C\u539F\u56E0","healthEnergy"),this.addNavButton(t,"\u4F53\u91CD","\u8BB0\u5F55\u4F53\u91CD\u548C\u8EAB\u4F53\u53D8\u5316","healthWeight")}renderHealthCategoryPanel(e,t,n){let i=this.addInput(e,`${t}\u5185\u5BB9`,"",n),a=this.addTextarea(e,"\u5907\u6CE8","\u53EF\u9009\uFF1A\u8865\u5145\u8FD9\u6B21\u8BB0\u5F55\u7684\u80CC\u666F\u6216\u611F\u53D7");this.addSubmit(e,`\u4FDD\u5B58${t}\u8BB0\u5F55`,async()=>{await this.plugin.addHealthCategoryRecord(t,i.value,a.value),new o.Notice(`${t}\u8BB0\u5F55\u5DF2\u5199\u5165\u5065\u5EB7\u8BB0\u5F55\u3002`),this.goBack(),await this.render()})}renderFinancePanel(e){let t=this.addInput(e,"\u652F\u51FA","","\u4F8B\u5982\uFF1A35.8\uFF0C\u82B1\u94B1\u65F6\u586B\u5199"),n=this.addInput(e,"\u6536\u5165","","\u4F8B\u5982\uFF1A2000\uFF0C\u6536\u94B1\u65F6\u586B\u5199"),i=e.createDiv({cls:"lifeos-field-wrap"});i.createEl("label",{text:"\u5E01\u79CD"});let a=i.createEl("select",{cls:"lifeos-field"});for(let c of this.plugin.settings.financeCurrencies)a.createEl("option",{text:c,value:c});let s=this.addInput(e,"\u65B0\u589E\u5E01\u79CD","","\u4F8B\u5982\uFF1AEUR\u3001HKD"),r=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(r).setButtonText("\u6DFB\u52A0\u5E01\u79CD").onClick(async()=>{await this.plugin.addFinanceCurrency(s.value),new o.Notice("\u5E01\u79CD\u5DF2\u6DFB\u52A0\u3002"),await this.render()});let l=this.addInput(e,"\u539F\u56E0","","\u9910\u996E\u3001\u5DE5\u8D44\u3001\u4EA4\u901A\u3001\u5B66\u4E60\u7B49"),u=this.addTextarea(e,"\u5907\u6CE8","\u8865\u5145\u8BF4\u660E");this.addSubmit(e,"\u4FDD\u5B58\u8D22\u52A1\u8BB0\u5F55",async()=>{await this.plugin.addFinanceRecord({expense:t.value,income:n.value,currency:a.value,reason:l.value,note:u.value}),new o.Notice("\u8D22\u52A1\u8BB0\u5F55\u5DF2\u5199\u5165\u8D22\u52A1\u8BB0\u5F55\u3002"),this.goBack(),await this.render()})}renderRelationshipPanel(e){let t=this.addInput(e,"\u59D3\u540D","","\u8054\u7CFB\u4EBA\u59D3\u540D"),n=this.addInput(e,"\u5173\u7CFB","","\u670B\u53CB\u3001\u540C\u5B66\u3001\u5BB6\u4EBA\u3001\u540C\u4E8B"),i=this.addInput(e,"\u751F\u65E5","","YYYY-MM-DD\uFF0C\u53EF\u9009"),a=this.addInput(e,"\u57CE\u5E02","","\u53EF\u9009"),s=this.addTextarea(e,"\u91CD\u8981\u4FE1\u606F","\u5BF9\u65B9\u559C\u6B22\u4EC0\u4E48\u3001\u6700\u8FD1\u5728\u610F\u4EC0\u4E48"),r=this.addInput(e,"\u4E0B\u4E00\u6B21\u5173\u5FC3","","\u4F8B\u5982\uFF1A\u5468\u672B\u95EE\u5019\u8FD1\u51B5");this.addSubmit(e,"\u521B\u5EFA\u8054\u7CFB\u4EBA",async()=>{await this.plugin.createRelationship({name:t.value,relation:n.value,birthday:i.value,city:a.value,likes:s.value,nextAction:r.value}),new o.Notice("\u8054\u7CFB\u4EBA\u5DF2\u521B\u5EFA\u3002"),this.goBack(),await this.render()})}renderReviewPanel(e){e.createEl("p",{text:`\u590D\u76D8\u5199\u5165 ${this.plugin.databasePath("11_\u590D\u76D8\u603B\u7ED3")}/\u590D\u76D8\u79CD\u7C7B.md\uFF0C\u540C\u79CD\u7C7B\u8BB0\u5728\u540C\u4E00\u6587\u4EF6\u3002`,cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-field-wrap"});t.createEl("label",{text:"\u590D\u76D8\u79CD\u7C7B"});let n=t.createEl("select",{cls:"lifeos-field"});for(let r of this.plugin.settings.reviewCategories)n.createEl("option",{text:r,value:r});let i=this.addInput(e,"\u65B0\u589E\u79CD\u7C7B","","\u4F8B\u5982\uFF1A\u5B63\u5EA6\u590D\u76D8\u3001\u9879\u76EE\u590D\u76D8"),a=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(a).setButtonText("\u6DFB\u52A0\u79CD\u7C7B").onClick(async()=>{await this.plugin.addReviewCategory(i.value),new o.Notice("\u590D\u76D8\u79CD\u7C7B\u5DF2\u6DFB\u52A0\u3002"),await this.render()});let s=this.addTextarea(e,"\u590D\u76D8\u5185\u5BB9","\u76F4\u63A5\u5199\u4E0B\u4F60\u7684\u590D\u76D8");this.addSubmit(e,"\u4FDD\u5B58\u590D\u76D8",async()=>{await this.plugin.createReview({scope:n.value,content:s.value}),new o.Notice("\u590D\u76D8\u5DF2\u4FDD\u5B58\u3002"),this.goBack(),await this.render()})}renderDatabasePanel(e){let t=this.plugin.getDatabaseFiles();e.createEl("p",{text:`LifeOS \u9ED8\u8BA4\u53EA\u8BFB\u5199 ${this.plugin.settings.databaseFolder}/ \u6587\u4EF6\u5939\uFF0C\u4E0D\u4E3B\u52A8\u4FEE\u6539\u5176\u4ED6\u7B14\u8BB0\u3002`,cls:"lifeos-subtitle"});let n=e.createDiv({cls:"lifeos-stat-grid"});this.addStat(n,"\u6570\u636E\u5E93\u6587\u4EF6\u5939",this.plugin.settings.databaseFolder),this.addStat(n,"Markdown \u6587\u4EF6",String(t.length)),this.addStat(n,"\u7CFB\u7EDF\u6A21\u5757",String(L.length));let i=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(i).setButtonText("\u8865\u9F50\u6570\u636E\u5E93\u7ED3\u6784").setCta().onClick(async()=>{await this.plugin.ensureDatabase(),new o.Notice("\u6570\u636E\u5E93\u7ED3\u6784\u5DF2\u68C0\u67E5\u5E76\u8865\u9F50\u3002"),await this.render()})}renderEvolutionPanel(e){let t=e.createDiv({cls:"lifeos-info-box"});t.createEl("p",{text:"\u8FD9\u4E2A\u529F\u80FD\u662F\u7ED9\u5916\u90E8 AI \u770B\u7684\u3002\u4F60\u5728\u8FD9\u91CC\u5199\u4E0B\u60F3\u8BA9\u7CFB\u7EDF\u5982\u4F55\u8FDB\u5316\uFF0C\u63D2\u4EF6\u4F1A\u628A\u7CFB\u7EDF\u80CC\u666F\u3001\u6F14\u5316\u8BB0\u5F55\u548C\u4F60\u7684\u65B0\u65B9\u5411\u5199\u5165\u4E00\u4E2A\u56FA\u5B9A Markdown \u6587\u4EF6\u3002\u5916\u90E8 AI \u8BFB\u53D6\u8FD9\u4E2A\u6587\u4EF6\u540E\uFF0C\u5C31\u80FD\u7406\u89E3 LifeOS \u4ECE\u539F\u59CB\u72B6\u6001\u5230\u5F53\u524D\u72B6\u6001\u7684\u53D8\u5316\uFF0C\u5E76\u7EE7\u7EED\u505A\u9002\u5E94\u6027\u4FEE\u6539\u3002",cls:"lifeos-info-text"}),t.createEl("p",{text:`AI \u5165\u53E3\u6587\u4EF6\uFF1A${this.plugin.getEvolutionPath()}`,cls:"lifeos-info-path"});let n=this.addTextarea(e,"\u4F60\u60F3\u63D0\u51FA\u7684\u8FDB\u5316\u65B9\u5411","\u4F8B\u5982\uFF1A\u6211\u5E0C\u671B\u76EE\u6807\u6A21\u5757\u80FD\u6309\u7167\u4EBA\u751F\u9886\u57DF\u5206\u7EC4\uFF0C\u5E76\u663E\u793A\u6BCF\u4E2A\u9886\u57DF\u7684\u8FDB\u5EA6"),i=this.addTextarea(e,"\u4F7F\u7528\u80CC\u666F","\u4F60\u662F\u5728\u4EC0\u4E48\u573A\u666F\u4E0B\u53D1\u73B0\u8FD9\u4E2A\u9700\u6C42\u7684\uFF1F\u73B0\u5728\u7528\u8D77\u6765\u54EA\u91CC\u4E0D\u987A\uFF1F"),a=this.addTextarea(e,"\u7406\u60F3\u6548\u679C","\u4FEE\u6539\u5B8C\u6210\u540E\uFF0C\u4F60\u5E0C\u671B\u9762\u677F\u770B\u8D77\u6765\u6216\u7528\u8D77\u6765\u662F\u4EC0\u4E48\u6837\u5B50\uFF1F"),s=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(s).setButtonText("\u8BB0\u5F55\u8FDB\u5316\u65B9\u5411").setCta().onClick(async()=>{await this.plugin.addEvolutionRequest({direction:n.value,context:i.value,expected:a.value}),new o.Notice("\u8FDB\u5316\u65B9\u5411\u5DF2\u5199\u5165\u7CFB\u7EDF\u81EA\u6211\u8FDB\u5316\u6587\u4EF6\u3002"),this.goBack(),await this.render()}),new o.ButtonComponent(s).setButtonText("\u6253\u5F00\u8FDB\u5316\u6587\u4EF6").onClick(async()=>{await this.plugin.ensureFile(this.plugin.getEvolutionPath(),this.plugin.createEvolutionContent());let r=this.plugin.app.vault.getAbstractFileByPath(this.plugin.getEvolutionPath());r instanceof o.TFile&&(this.close(),await this.plugin.app.workspace.getLeaf(!0).openFile(r))})}addStat(e,t,n){let i=e.createDiv({cls:"lifeos-stat"});i.createSpan({text:t,cls:"lifeos-stat-label"}),i.createSpan({text:n,cls:"lifeos-stat-value"})}async renderTodayPreview(e){let t=e.createDiv({cls:"lifeos-card lifeos-preview-card"});t.addEventListener("click",()=>{this.navigatePreview("today"),this.render()}),t.createEl("h3",{text:"\u4ECA\u65E5\u9884\u89C8"});let n=await this.plugin.getTodayPreviewData(),i=t.createEl("ul",{cls:"lifeos-card-list"}),a=[n.mood&&`\u60C5\u7EEA\uFF1A${n.mood}`,n.energy&&`\u7CBE\u529B\uFF1A${n.energy}`,n.sleep&&`\u7761\u7720\uFF1A${n.sleep}`,n.exercise&&`\u8FD0\u52A8\uFF1A${n.exercise}`].filter(Boolean);if(a.length===0){i.createEl("li",{text:"\u6682\u672A\u586B\u5199\u4ECA\u65E5\u8BB0\u5F55\u3002",cls:"lifeos-empty"});return}for(let s of a)i.createEl("li",{text:s})}async renderLearningPreview(e){let t=e.createDiv({cls:"lifeos-card lifeos-preview-card"});t.addEventListener("click",()=>{this.navigatePreview("learning"),this.render()}),t.createEl("h3",{text:"\u5B66\u4E60\u9884\u89C8"});let n=await this.plugin.getItems("04_\u5B66\u4E60\u7CFB\u7EDF","learning_note",50),i=await this.plugin.getVocabularyCards(50),a=t.createEl("ul",{cls:"lifeos-card-list"});a.createEl("li",{text:`\u901A\u7528\u7B14\u8BB0\uFF1A${n.length} \u7BC7`}),a.createEl("li",{text:`\u82F1\u8BED\u5355\u8BCD\uFF1A${i.length} \u4E2A`}),a.createEl("li",{text:"\u70B9\u51FB\u9009\u62E9\u9884\u89C8\u7C7B\u578B",cls:"lifeos-empty"})}async renderDatabasePreview(e){let t=e.createDiv({cls:"lifeos-card lifeos-preview-card"});t.addEventListener("click",()=>{this.navigatePreview("database"),this.render()}),t.createEl("h3",{text:"\u6570\u636E\u5E93\u9884\u89C8"});let n=this.plugin.getDatabaseFiles().length,i=t.createEl("ul",{cls:"lifeos-card-list"});i.createEl("li",{text:`\u6587\u4EF6\u5939\uFF1A${this.plugin.settings.databaseFolder}`}),i.createEl("li",{text:`Markdown \u6587\u4EF6\uFF1A${n}`}),i.createEl("li",{text:`\u7CFB\u7EDF\u6A21\u5757\uFF1A${L.length}`})}async renderEvolutionPreview(e){let t=e.createDiv({cls:"lifeos-card lifeos-preview-card"});t.addEventListener("click",()=>{this.navigatePreview("evolution"),this.render()}),t.createEl("h3",{text:"\u7CFB\u7EDF\u8FDB\u5316\u9884\u89C8"});let n=await this.plugin.getEvolutionPreviewSections(),i=t.createEl("ul",{cls:"lifeos-card-list"});if(n.length===0){i.createEl("li",{text:"\u6682\u65E0\u8FDB\u5316\u8BB0\u5F55\u3002",cls:"lifeos-empty"});return}for(let a of n)i.createEl("li",{text:`${a.title}\uFF1A${a.lines.length} \u6761`});let s=n.find(a=>a.title==="\u5DF2\u5B8C\u6210\u4FEE\u6539\u8BB0\u5F55");if(s)for(let a of s.lines.slice(-3))i.createEl("li",{text:a});i.createEl("li",{text:"\u70B9\u51FB\u67E5\u770B\u5168\u90E8\u8FDB\u5316\u8FC7\u7A0B",cls:"lifeos-empty"})}async renderTasksPreview(e){let t=e.createDiv({cls:"lifeos-card lifeos-preview-card"});t.addEventListener("click",()=>{this.navigatePreview("tasks"),this.render()}),t.createEl("h3",{text:"\u5F85\u529E\u9884\u89C8"});let n=await this.plugin.getOpenTasks(6),i=t.createEl("ul",{cls:"lifeos-card-list"});if(n.length===0){i.createEl("li",{text:"\u6CA1\u6709\u672A\u5B8C\u6210\u4EFB\u52A1\u3002",cls:"lifeos-empty"});return}for(let a of n)i.createEl("li",{text:a.text})}async renderItemsPreview(e,t,n,i,a){let s=e.createDiv({cls:"lifeos-card lifeos-preview-card"});s.addEventListener("click",()=>{this.navigatePreview(a),this.render()}),s.createEl("h3",{text:t});let r=await this.plugin.getItems(n,i),l=s.createEl("ul",{cls:"lifeos-card-list"});if(r.length===0){l.createEl("li",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let c of r){let u=l.createEl("li",{cls:"lifeos-progress"}),p=u.createDiv({cls:"lifeos-progress-row"});if(p.createSpan({text:c.title}),p.createSpan({text:c.progress===null?c.status:`${c.progress}%`}),c.progress!==null){let m=u.createEl("progress");m.max=100,m.value=Math.max(0,Math.min(100,c.progress))}}}renderSimplePreview(e,t,n,i){let a=e.createDiv({cls:"lifeos-card lifeos-preview-card"});a.addEventListener("click",()=>{this.navigatePreview(i),this.render()}),a.createEl("h3",{text:t}),a.createEl("p",{text:n,cls:"lifeos-empty"})}async renderPreviewDetailPanel(e){let t=this.getPreviewConfig(this.previewTarget);e.createEl("p",{text:`${t.title}\u9884\u89C8\u53EA\u5C55\u793A\u5DF2\u7ECF\u8BB0\u5F55\u7684\u5185\u5BB9\uFF0C\u4E0D\u5728\u8FD9\u91CC\u65B0\u589E\u8BB0\u5F55\u3002`,cls:"lifeos-subtitle"});let n=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(n).setButtonText(`\u8FDB\u5165${t.recordLabel}`).setCta().onClick(()=>{this.navigate(t.recordPanel),this.render()}),this.previewTarget==="tasks"?await this.renderTaskPreviewDetail(e):this.previewTarget==="today"?await this.renderTodayPreviewDetail(e):this.previewTarget==="quick"?await this.renderModuleRecordPreview(e,"01_\u6BCF\u65E5\u8BB0\u5F55","\u5FEB\u901F\u8BB0\u5F55.md"):this.previewTarget==="goals"?await this.renderItemPreviewDetail(e,"02_\u76EE\u6807\u7BA1\u7406","goal"):this.previewTarget==="projects"?await this.renderItemPreviewDetail(e,"03_\u4EFB\u52A1\u4E0E\u9879\u76EE","any"):this.previewTarget==="learning"?this.renderLearningPreviewDetail(e):this.previewTarget==="learningNote"?await this.renderItemPreviewDetail(e,"04_\u5B66\u4E60\u7CFB\u7EDF","learning_note"):this.previewTarget==="english"?await this.renderEnglishPreviewDetail(e):this.previewTarget==="relationships"?await this.renderItemPreviewDetail(e,"07_\u4EBA\u9645\u5173\u7CFB","relationship"):this.previewTarget==="reviews"?this.renderReviewPreviewDetail(e):this.previewTarget==="reviewItem"?await this.renderReviewItemPreviewDetail(e):this.previewTarget==="health"?await this.renderModuleRecordPreview(e,"05_\u5065\u5EB7\u7BA1\u7406","\u5065\u5EB7\u8BB0\u5F55.md"):this.previewTarget==="finance"?await this.renderModuleRecordPreview(e,"06_\u8D22\u52A1\u7BA1\u7406","\u8D22\u52A1\u8BB0\u5F55.md"):this.previewTarget==="database"?this.renderDatabasePreviewDetail(e):this.previewTarget==="evolution"&&await this.renderEvolutionPreviewDetail(e)}navigateReviewPreview(e){this.previewReviewScope=e,this.navigatePreview("reviewItem"),this.render()}async renderReviewsPreview(e){let t=e.createDiv({cls:"lifeos-card lifeos-preview-card"});t.addEventListener("click",()=>{this.navigatePreview("reviews"),this.render()}),t.createEl("h3",{text:"\u590D\u76D8\u9884\u89C8"});let n=t.createEl("ul",{cls:"lifeos-card-list"});for(let i of this.plugin.settings.reviewCategories){let a=this.plugin.app.vault.getAbstractFileByPath(this.plugin.getReviewPath(i)),s=0;a instanceof o.TFile&&(s=this.plugin.extractReviewSections(await this.plugin.app.vault.cachedRead(a)).length),n.createEl("li",{text:`${i}\uFF1A${s} \u7BC7`})}n.createEl("li",{text:"\u70B9\u51FB\u9009\u62E9\u590D\u76D8\u79CD\u7C7B",cls:"lifeos-empty"})}renderReviewPreviewDetail(e){e.createEl("p",{text:"\u9009\u62E9\u8981\u9884\u89C8\u7684\u590D\u76D8\u79CD\u7C7B\u3002",cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-nav-grid"});for(let n of this.plugin.settings.reviewCategories)this.addPreviewNavButton(t,n,`\u67E5\u770B ${n} \u5185\u5BB9`,"review:"+n)}addPreviewNavButton(e,t,n,i){let a=e.createEl("button",{cls:"lifeos-nav-button"});a.createSpan({text:t,cls:"lifeos-nav-title"}),a.createSpan({text:n,cls:"lifeos-nav-desc"}),a.addEventListener("click",()=>{i.startsWith("review:")?this.navigateReviewPreview(i.slice(7)):this.navigatePreview(i),this.render()})}async renderReviewItemPreviewDetail(e){let t=this.previewReviewScope;e.createEl("h3",{text:t});let n=this.plugin.getReviewPath(t),i=this.plugin.app.vault.getAbstractFileByPath(n);if(!(i instanceof o.TFile)){e.createEl("p",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}let a=this.plugin.extractReviewSections(await this.plugin.app.vault.cachedRead(i));if(a.length===0){e.createEl("p",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}let s=e.createDiv({cls:"lifeos-preview-detail-grid"});for(let r of a.reverse()){let l=s.createDiv({cls:"lifeos-card"});l.createEl("h3",{text:r.date}),l.createEl("div",{text:r.text,cls:"lifeos-review-text"})}let c=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(c).setButtonText("\u6253\u5F00\u6587\u4EF6").onClick(()=>{this.plugin.app.workspace.getLeaf(!0).openFile(i)})}getPreviewConfig(e){var n;if(e==="reviewItem")return{title:this.previewReviewScope||"\u590D\u76D8",recordLabel:"\u590D\u76D8\u9762\u677F",recordPanel:"review"};if(e==="review")return{title:"\u590D\u76D8",recordLabel:"\u590D\u76D8\u9762\u677F",recordPanel:"review"};let t={tasks:{title:"\u5F85\u529E",recordLabel:"\u4EFB\u52A1\u9762\u677F",recordPanel:"task"},today:{title:"\u4ECA\u65E5",recordLabel:"\u4ECA\u65E5\u586B\u5199",recordPanel:"today"},quick:{title:"\u5FEB\u901F\u8BB0\u5F55",recordLabel:"\u5FEB\u901F\u8BB0\u5F55",recordPanel:"quick"},goals:{title:"\u76EE\u6807",recordLabel:"\u76EE\u6807\u9762\u677F",recordPanel:"goal"},projects:{title:"\u9879\u76EE",recordLabel:"\u9879\u76EE\u9762\u677F",recordPanel:"project"},learning:{title:"\u5B66\u4E60",recordLabel:"\u5B66\u4E60\u9762\u677F",recordPanel:"learning"},learningNote:{title:"\u901A\u7528\u7B14\u8BB0",recordLabel:"\u901A\u7528\u5B66\u4E60\u7B14\u8BB0",recordPanel:"learningNote"},english:{title:"\u82F1\u8BED",recordLabel:"\u82F1\u8BED\u5B66\u4E60",recordPanel:"english"},relationships:{title:"\u4EBA\u9645",recordLabel:"\u4EBA\u9645\u9762\u677F",recordPanel:"relationship"},health:{title:"\u5065\u5EB7",recordLabel:"\u5065\u5EB7\u9762\u677F",recordPanel:"health"},finance:{title:"\u8D22\u52A1",recordLabel:"\u8D22\u52A1\u9762\u677F",recordPanel:"finance"},reviews:{title:"\u590D\u76D8",recordLabel:"\u590D\u76D8\u9762\u677F",recordPanel:"review"},database:{title:"\u6570\u636E\u5E93",recordLabel:"\u6570\u636E\u5E93",recordPanel:"database"},evolution:{title:"\u7CFB\u7EDF\u8FDB\u5316",recordLabel:"\u7CFB\u7EDF\u8FDB\u5316",recordPanel:"evolution"}};return(n=t[e])!=null?n:t.tasks}async renderTaskPreviewDetail(e){let t=await this.plugin.getOpenTasks(50),n=await this.plugin.getCompletedTasks(30);this.renderTaskList(e,"\u672A\u5B8C\u6210\u4EFB\u52A1",t),this.renderTaskList(e,"\u5DF2\u5B8C\u6210\u4EFB\u52A1",n)}renderTaskList(e,t,n){e.createEl("h3",{text:t});let i=e.createEl("ul",{cls:"lifeos-card-list lifeos-preview-list"});if(n.length===0){i.createEl("li",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let a of n)i.createEl("li",{text:a.text})}async renderTodayPreviewDetail(e){let t=await this.plugin.getTodayPreviewData(),n=e.createDiv({cls:"lifeos-card"});n.createEl("h3",{text:this.plugin.today()}),n.createEl("p",{text:`\u60C5\u7EEA\uFF1A${t.mood||"\u672A\u8BB0\u5F55"}`,cls:"lifeos-empty"}),n.createEl("p",{text:`\u7CBE\u529B\uFF1A${t.energy||"\u672A\u8BB0\u5F55"}`,cls:"lifeos-empty"}),n.createEl("p",{text:`\u7761\u7720\uFF1A${t.sleep||"\u672A\u8BB0\u5F55"}`,cls:"lifeos-empty"}),n.createEl("p",{text:`\u8FD0\u52A8\uFF1A${t.exercise||"\u672A\u8BB0\u5F55"}`,cls:"lifeos-empty"}),new o.ButtonComponent(n).setButtonText("\u6253\u5F00\u4ECA\u65E5\u8BB0\u5F55").onClick(()=>{this.plugin.app.workspace.getLeaf(!0).openFile(t.file)}),e.createEl("h3",{text:"\u4ECA\u65E5\u590D\u76D8"}),this.renderTextList(e,t.reviewLines)}renderLearningPreviewDetail(e){e.createEl("p",{text:"\u9009\u62E9\u8981\u9884\u89C8\u7684\u5B66\u4E60\u7C7B\u578B\u3002",cls:"lifeos-subtitle"});let t=e.createDiv({cls:"lifeos-nav-grid"});this.addPreviewNavButton(t,"\u901A\u7528\u7B14\u8BB0","\u8BFE\u7A0B\u3001\u8BFB\u4E66\u3001\u6587\u7AE0\u548C\u77E5\u8BC6\u6574\u7406","learningNote"),this.addPreviewNavButton(t,"\u82F1\u8BED","\u5355\u8BCD\u95EA\u5361\uFF0C\u70B9\u5361\u7FFB\u8F6C\u6B63\u53CD\u9762","english")}createFlipFlashcard(e,t){let n=e.createDiv({cls:"lifeos-flashcard-flip"}),i=n.createDiv({cls:"lifeos-flashcard-flip-inner"}),a=i.createDiv({cls:"lifeos-flashcard-face lifeos-flashcard-front"});a.createEl("strong",{text:t.word}),a.createEl("small",{text:"\u70B9\u51FB\u7FFB\u8F6C",cls:"lifeos-flashcard-hint"});let s=i.createDiv({cls:"lifeos-flashcard-face lifeos-flashcard-back"});s.createEl("p",{text:t.meaning}),t.example&&s.createEl("small",{text:t.example}),n.addEventListener("click",()=>n.toggleClass("lifeos-flipped",!n.hasClass("lifeos-flipped")))}async renderEnglishPreviewDetail(e){e.createEl("p",{text:"\u70B9\u51FB\u5361\u7247\u67E5\u770B\u91CA\u4E49\u548C\u4F8B\u53E5\u3002",cls:"lifeos-subtitle"});let t=await this.plugin.getVocabularyCards(50),n=e.createDiv({cls:"lifeos-flashcard-grid lifeos-flashcard-grid-flip"});if(t.length===0){e.createEl("p",{text:"\u6682\u65E0\u5355\u8BCD\u3002",cls:"lifeos-empty"});return}for(let i of t)this.createFlipFlashcard(n,i)}renderDatabasePreviewDetail(e){let t=this.plugin.getDatabaseFiles();e.createEl("p",{text:`LifeOS \u9ED8\u8BA4\u53EA\u8BFB\u5199 ${this.plugin.settings.databaseFolder}/ \u6587\u4EF6\u5939\u3002`,cls:"lifeos-subtitle"});let n=e.createDiv({cls:"lifeos-stat-grid"});this.addStat(n,"\u6570\u636E\u5E93\u6587\u4EF6\u5939",this.plugin.settings.databaseFolder),this.addStat(n,"Markdown \u6587\u4EF6",String(t.length)),this.addStat(n,"\u7CFB\u7EDF\u6A21\u5757",String(L.length)),e.createEl("h3",{text:"\u6700\u8FD1\u6587\u4EF6"}),this.renderTextList(e,t.slice(-20).map(i=>i.path))}async renderEvolutionPreviewDetail(e){let t=await this.plugin.getEvolutionPreviewSections();if(t.length===0){e.createEl("p",{text:"\u6682\u65E0\u8FDB\u5316\u8BB0\u5F55\u3002",cls:"lifeos-empty"});return}for(let n of t){e.createEl("h3",{text:n.title}),this.renderTextList(e,n.lines)}let n=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(n).setButtonText("\u6253\u5F00\u8FDB\u5316\u6587\u4EF6").onClick(async()=>{await this.plugin.ensureFile(this.plugin.getEvolutionPath(),this.plugin.createEvolutionContent());let i=this.plugin.app.vault.getAbstractFileByPath(this.plugin.getEvolutionPath());i instanceof o.TFile&&(this.close(),await this.plugin.app.workspace.getLeaf(!0).openFile(i))})}renderTextList(e,t){let n=e.createEl("ul",{cls:"lifeos-card-list lifeos-preview-list"}),i=Array.isArray(t)?t:[t];if(i.length===0){n.createEl("li",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let a of i)n.createEl("li",{text:a})}async renderItemPreviewDetail(e,t,n){let i=await this.plugin.getItems(t,n,50),a=e.createDiv({cls:"lifeos-preview-detail-grid"});if(i.length===0){a.createEl("p",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let s of i){let r=a.createDiv({cls:"lifeos-card"});if(r.createEl("h3",{text:s.title}),r.createEl("p",{text:`\u72B6\u6001\uFF1A${s.status}`,cls:"lifeos-empty"}),s.progress!==null){let l=r.createEl("progress");l.max=100,l.value=Math.max(0,Math.min(100,s.progress))}new o.ButtonComponent(r).setButtonText("\u6253\u5F00\u6587\u4EF6").onClick(()=>{this.plugin.app.workspace.getLeaf(!0).openFile(s.file)})}}async renderDailySectionPreview(e,t){let n=[],i=this.plugin.databasePath("01_\u6BCF\u65E5\u8BB0\u5F55"),a=this.plugin.app.vault.getMarkdownFiles().filter(r=>r.path.startsWith(`${i}/`)).sort((r,l)=>l.basename.localeCompare(r.basename));for(let r of a.slice(0,20)){let l=await this.plugin.app.vault.cachedRead(r);for(let c of M(l,t))n.push({file:r,text:c})}let s=e.createEl("ul",{cls:"lifeos-card-list lifeos-preview-list"});if(n.length===0){s.createEl("li",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let r of n.slice(0,50))s.createEl("li",{text:`${r.file.basename} \xB7 ${r.text}`})}async renderModuleRecordCardPreview(e,t,n,i,a){let s=e.createDiv({cls:"lifeos-card lifeos-preview-card"});s.addEventListener("click",()=>{this.navigatePreview(a),this.render()}),s.createEl("h3",{text:t});let r=await this.getModuleRecordLines(n,i),l=s.createEl("ul",{cls:"lifeos-card-list"});if(r.length===0){l.createEl("li",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let c of r.slice(-6).reverse())l.createEl("li",{text:c})}async getModuleRecordLines(e,t){let n=this.plugin.databasePath(e,t),i=this.plugin.app.vault.getAbstractFileByPath(n);return i instanceof o.TFile?this.plugin.extractRecordLines(await this.plugin.app.vault.cachedRead(i)):[]}async renderModuleRecordPreview(e,t,n){let i=await this.getModuleRecordLines(t,n),a=e.createEl("ul",{cls:"lifeos-card-list lifeos-preview-list"});if(i.length===0){a.createEl("li",{text:"\u6682\u65E0\u5185\u5BB9\u3002",cls:"lifeos-empty"});return}for(let s of i.slice(-50).reverse())a.createEl("li",{text:s})}renderPreviewSettingsPanel(e){e.createEl("p",{text:"\u9009\u62E9\u4E3B\u9762\u677F\u4E0B\u65B9\u8981\u663E\u793A\u7684\u9884\u89C8\u5361\u7247\u3002\u9884\u89C8\u5361\u7247\u53EF\u4EE5\u70B9\u51FB\u8FDB\u5165\u5BF9\u5E94\u9762\u677F\u3002",cls:"lifeos-subtitle"});let t=[{id:"tasks",label:"\u5F85\u529E\u9884\u89C8"},{id:"today",label:"\u4ECA\u65E5\u9884\u89C8"},{id:"quick",label:"\u5FEB\u901F\u8BB0\u5F55\u9884\u89C8"},{id:"goals",label:"\u76EE\u6807\u9884\u89C8"},{id:"projects",label:"\u9879\u76EE\u9884\u89C8"},{id:"learning",label:"\u5B66\u4E60\u9884\u89C8"},{id:"relationships",label:"\u4EBA\u9645\u9884\u89C8"},{id:"health",label:"\u5065\u5EB7\u9884\u89C8"},{id:"finance",label:"\u8D22\u52A1\u9884\u89C8"},{id:"reviews",label:"\u590D\u76D8\u9884\u89C8"},{id:"database",label:"\u6570\u636E\u5E93\u9884\u89C8"},{id:"evolution",label:"\u7CFB\u7EDF\u8FDB\u5316\u9884\u89C8"}],n=new Set(this.plugin.settings.homePreviewPanels),i=e.createDiv({cls:"lifeos-preview-settings"});for(let s of t){let r=i.createEl("label",{cls:"lifeos-preview-option"}),l=r.createEl("input",{type:"checkbox"});l.checked=n.has(s.id),r.createSpan({text:s.label}),l.addEventListener("change",async()=>{l.checked?n.add(s.id):n.delete(s.id),this.plugin.settings.homePreviewPanels=t.map(c=>c.id).filter(c=>n.has(c)),await this.plugin.saveSettings()})}let a=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(a).setButtonText("\u4FDD\u5B58\u5E76\u8FD4\u56DE").setCta().onClick(async()=>{await this.plugin.saveSettings(),this.goBack(),await this.render()})}addInput(e,t,n,i){let a=e.createDiv({cls:"lifeos-field-wrap"});a.createEl("label",{text:t});let s=a.createEl("input",{type:"text",cls:"lifeos-field",placeholder:i});return s.value=n,s}addTextarea(e,t,n){let i=e.createDiv({cls:"lifeos-field-wrap"});return i.createEl("label",{text:t}),i.createEl("textarea",{cls:"lifeos-textarea",placeholder:n})}addSubmit(e,t,n){let i=e.createDiv({cls:"lifeos-actions"});new o.ButtonComponent(i).setButtonText(t).setCta().onClick(()=>void n())}},S=class extends o.PluginSettingTab{constructor(d,e){super(d,e),this.plugin=e}display(){let{containerEl:d}=this;d.empty(),d.createEl("h2",{text:"LifeOS Settings"}),new o.Setting(d).setName("Database folder").setDesc("LifeOS only reads and writes this folder by default.").addText(e=>e.setPlaceholder("LifeOS").setValue(this.plugin.settings.databaseFolder).onChange(async t=>{this.plugin.settings.databaseFolder=(0,o.normalizePath)(t.trim()||f.databaseFolder),await this.plugin.saveSettings()})),new o.Setting(d).setName("Initialize database").setDesc("Create missing folders and starter Markdown files in the configured database folder.").addButton(e=>e.setButtonText("Initialize").onClick(async()=>{await this.plugin.ensureDatabase(),new o.Notice("LifeOS database initialized.")})),d.createEl("h3",{text:"AI API"}),d.createEl("p",{text:"Compatible with OpenAI-style /v1/chat/completions APIs, such as DeepSeek.",cls:"setting-item-description"}),new o.Setting(d).setName("API URL").setDesc("Base URL, for example https://api.deepseek.com").addText(e=>e.setPlaceholder("https://api.deepseek.com").setValue(this.plugin.settings.aiApiUrl).onChange(async t=>{this.plugin.settings.aiApiUrl=t.trim()||f.aiApiUrl,await this.plugin.saveSettings()})),new o.Setting(d).setName("Model ID").setDesc("For example deepseek-chat, deepseek-reasoner, or another compatible model.").addText(e=>e.setPlaceholder("deepseek-chat").setValue(this.plugin.settings.aiModel).onChange(async t=>{this.plugin.settings.aiModel=t.trim()||f.aiModel,await this.plugin.saveSettings()})),new o.Setting(d).setName("API Key").setDesc("Stored in Obsidian plugin data on this device.").addText(e=>{e.inputEl.type="password",e.setPlaceholder("sk-...").setValue(this.plugin.settings.aiApiKey).onChange(async t=>{this.plugin.settings.aiApiKey=t.trim(),await this.plugin.saveSettings()})}),new o.Setting(d).setName("AI System Prompt").setDesc("Controls how the LifeOS AI assistant behaves.").addTextArea(e=>{e.inputEl.rows=5,e.setValue(this.plugin.settings.aiSystemPrompt).onChange(async t=>{this.plugin.settings.aiSystemPrompt=t.trim()||f.aiSystemPrompt,await this.plugin.saveSettings()})})}};function x(h){let d={},e=h.match(/^---\n([\s\S]*?)\n---/);if(!e)return d;for(let t of e[1].split(`
`)){let n=t.trim(),i=n.indexOf(":");if(i<=0)continue;let a=n.slice(0,i).trim(),s=n.slice(i+1).trim();d[a]=s.replace(/^["']|["']$/g,"")}return d}function w(h,d){if(!h.match(/^---\n([\s\S]*?)\n---/))return`---
${Object.entries(d).map(([s,r])=>`${s}: ${r}`).join(`
`)}
---

${h}`;let n={...x(h),...d},i=Object.entries(n).map(([a,s])=>`${a}: ${s}`).join(`
`);return h.replace(/^---\n[\s\S]*?\n---/,`---
${i}
---`)}function _(h){if(!h)return null;let d=Number(h);return Number.isFinite(d)?d:null}function g(h,d,e){let t=new RegExp(`(^## ${k(d)}\\s*$)`,"m"),n=h.match(t);if(!n||n.index===void 0)return`${h.trimEnd()}

## ${d}

${e}
`;let i=n.index+n[0].length,a=h.slice(i),s=a.search(/\n##\s+/);if(s===-1)return`${h.slice(0,i)}${a.trimEnd()}
${e}
`;let r=i+s,l=h.slice(0,r).trimEnd(),c=h.slice(r);return`${l}
${e}${c}`}function M(h,d){let e=new RegExp(`^## ${k(d)}\\s*$`,"m"),t=h.match(e);if(!t||t.index===void 0)return[];let n=t.index+t[0].length,i=h.slice(n),a=i.search(/\n##\s+/);return(a===-1?i:i.slice(0,a)).split(`
`).map(r=>r.trim()).filter(r=>r.startsWith("- ")).map(r=>r.replace(/^-\s*/,""))}function N(h,d){let e=new RegExp(`^## ${k(d)}\\s*$`,"m"),t=h.match(e);if(!t||t.index===void 0)return[];let n=t.index+t[0].length,i=h.slice(n),a=i.search(/\n##\s+/);return(a===-1?i:i.slice(0,a)).split(`
`).map(s=>s.trim()).filter(s=>s.length>0)}function k(h){return h.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function v(h){return h.replace(/[\\/:*?"<>|#^[\]]/g," ").replace(/\s+/g," ").trim()}function O(h){let d=h.match(/^path:\s*(.+)$/m),e=h.match(/^mode:\s*(append|overwrite)$/m),t=h.match(/^content:\s*\n([\s\S]*)$/m);return!d||!e||!t?null:{path:d[1].trim(),mode:e[1].trim(),content:t[1].trim()}}

/* LifeOS extension: career, emotion, and knowledge panels. Added by external AI on 2026-06-10. */
(()=>{if(globalThis.__lifeosCareerEmotionKnowledgePatch)return;globalThis.__lifeosCareerEmotionKnowledgePatch=!0;
const oldLoadSettings=y.prototype.loadSettings;
y.prototype.loadSettings=async function(){await oldLoadSettings.call(this);for(const id of["career","emotion","knowledge"])this.settings.homePreviewPanels.includes(id)||this.settings.homePreviewPanels.push(id)};
const oldEnsureDatabase=y.prototype.ensureDatabase;
y.prototype.ensureDatabase=async function(){await oldEnsureDatabase.call(this);await this.ensureFile(this.getCareerIndexPath(),this.createCareerIndexContent());await this.ensureFile(this.getEmotionRecordPath(),this.createEmotionRecordContent());await this.ensureFile(this.getKnowledgeIndexPath(),this.createKnowledgeIndexContent());await this.ensureFile(this.databasePath("12_模板","AI模板-职业.md"),"# AI 模板 - 职业发展\n\n写入位置：`LifeOS/08_职业发展/主题.md`\n\n```markdown\n---\ntype: career_note\ntitle: 主题\ncategory: 职业定位/能力/作品集/机会/面试\nstatus: 进行中\ncreated: YYYY-MM-DD\n---\n\n# 主题\n\n## 背景\n\n\n## 内容\n\n\n## 下一步\n\n- [ ] \n```\n");await this.ensureFile(this.databasePath("12_模板","AI模板-情绪.md"),"# AI 模板 - 情绪与自我觉察\n\n写入位置：`LifeOS/09_情绪与自我觉察/情绪记录.md`\n\n```markdown\n## YYYY-MM-DD\n\n- YYYY-MM-DD HH:mm | 情绪 | 强度 | 触发 | 需要 | 回应\n```\n");await this.ensureFile(this.databasePath("12_模板","AI模板-知识库.md"),"# AI 模板 - 知识库\n\n写入位置：`LifeOS/10_知识库/主题.md`\n\n```markdown\n---\ntype: knowledge_note\ntitle: 主题\ncategory: \nsource: \ncreated: YYYY-MM-DD\n---\n\n# 主题\n\n## 核心概念\n\n\n## 我的理解\n\n\n## 可应用场景\n\n\n## 关联笔记\n\n- [[]]\n```\n")};
y.prototype.getCareerIndexPath=function(){return this.databasePath("08_职业发展","职业发展总览.md")};
y.prototype.getEmotionRecordPath=function(){return this.databasePath("09_情绪与自我觉察","情绪记录.md")};
y.prototype.getKnowledgeIndexPath=function(){return this.databasePath("10_知识库","知识库总览.md")};
y.prototype.createCareerIndexContent=function(){return`---\ntype: career_index\nupdated_at: ${this.today()}\n---\n\n# 职业发展总览\n\n`};
y.prototype.createEmotionRecordContent=function(){return`---\ntype: emotion_record\nupdated_at: ${this.today()}\n---\n\n# 情绪与自我觉察记录\n\n`};
y.prototype.createKnowledgeIndexContent=function(){return`---\ntype: knowledge_index\nupdated_at: ${this.today()}\n---\n\n# 知识库总览\n\n`};
y.prototype.createCareerNote=async function(e){let t=e.title.trim();if(!t){new o.Notice("职业主题不能为空。");return}let n=this.databasePath("08_职业发展",`${v(t)}.md`),i=`---\ntype: career_note\ntitle: ${t}\ncategory: ${e.category.trim()||"职业发展"}\nstatus: 进行中\ncreated: ${this.today()}\n---\n\n# ${t}\n\n## 背景\n\n${e.context.trim()}\n\n## 内容\n\n${e.content.trim()}\n\n## 下一步\n\n- [ ] ${e.next.trim()}\n`;await this.ensureFile(n,i)};
y.prototype.addEmotionRecord=async function(e){let t=e.emotion.trim();if(!t){new o.Notice("情绪不能为空。");return}await this.ensureFile(this.getEmotionRecordPath(),this.createEmotionRecordContent());let n=this.app.vault.getAbstractFileByPath(this.getEmotionRecordPath());if(!(n instanceof o.TFile))return;let i=await this.app.vault.read(n),a=window.moment().format("YYYY-MM-DD HH:mm"),s=`- ${a} | ${t} | ${e.intensity.trim()||"未记录"} | ${e.trigger.trim()||"未记录"} | ${e.need.trim()||"未记录"} | ${e.response.trim()||"未记录"}`;await this.app.vault.modify(n,g(w(i,{updated_at:this.today()}),this.today(),s))};
y.prototype.createKnowledgeNote=async function(e){let t=e.title.trim();if(!t){new o.Notice("知识主题不能为空。");return}let n=this.databasePath("10_知识库",`${v(t)}.md`),i=`---\ntype: knowledge_note\ntitle: ${t}\ncategory: ${e.category.trim()}\nsource: ${e.source.trim()}\ncreated: ${this.today()}\n---\n\n# ${t}\n\n## 核心概念\n\n${e.concept.trim()}\n\n## 我的理解\n\n${e.understanding.trim()}\n\n## 可应用场景\n\n${e.application.trim()}\n\n## 关联笔记\n\n- [[]]\n`;await this.ensureFile(n,i)};
const oldRender=b.prototype.render;
b.prototype.render=async function(){if(!["career","emotion","knowledge"].includes(this.panel))return oldRender.call(this);this.contentEl.empty();this.modalEl.toggleClass("lifeos-expanded",this.expanded);let e=this.contentEl.createDiv({cls:"lifeos-shell"});this.renderHeader(e);let t=e.createDiv({cls:"lifeos-content-layout"}),n=t.createDiv({cls:"lifeos-body"});this.renderEvolutionSidebar(t);this.panel==="career"?this.renderCareerPanel(n):this.panel==="emotion"?this.renderEmotionPanel(n):this.renderKnowledgePanel(n)};
const oldGetTitle=b.prototype.getTitle;
b.prototype.getTitle=function(){return{career:"职业发展",emotion:"情绪与自我觉察",knowledge:"知识库"}[this.panel]||oldGetTitle.call(this)};
const oldRenderHome=b.prototype.renderHome;
b.prototype.renderHome=async function(e){await oldRenderHome.call(this,e);let t=e.querySelector(".lifeos-nav-grid");if(t&&!t.querySelector('[data-lifeos-extra="career"]')){let n=[["职业","职业定位、能力、作品和机会","career"],["情绪","记录情绪、触发、需要和回应","emotion"],["知识库","沉淀概念、理解和可应用场景","knowledge"]];for(let[i,a,s]of n){let r=t.createEl("button",{cls:"lifeos-nav-button"});r.dataset.lifeosExtra=s;r.createSpan({text:i,cls:"lifeos-nav-title"});r.createSpan({text:a,cls:"lifeos-nav-desc"});r.addEventListener("click",()=>{this.navigate(s);this.render()})}}};
b.prototype.renderCareerPanel=function(e){e.createEl("p",{text:"职业发展内容会写入 LifeOS/08_职业发展/ 下的独立 Markdown 文件。",cls:"lifeos-subtitle"});let t=this.addInput(e,"主题","","例如：前端作品集优化"),n=this.addInput(e,"类型","能力","职业定位 / 能力 / 作品集 / 机会 / 面试"),i=this.addTextarea(e,"背景","这个职业事项为什么重要"),a=this.addTextarea(e,"内容","记录想法、分析、准备或结果"),s=this.addInput(e,"下一步","","下一个可执行动作");this.addSubmit(e,"创建职业记录",async()=>{await this.plugin.createCareerNote({title:t.value,category:n.value,context:i.value,content:a.value,next:s.value});new o.Notice("职业记录已创建。");this.goBack();await this.render()})};
b.prototype.renderEmotionPanel=function(e){e.createEl("p",{text:"情绪记录会按时间写入 LifeOS/09_情绪与自我觉察/情绪记录.md。",cls:"lifeos-subtitle"});let t=this.addInput(e,"情绪","","例如：焦虑、平静、兴奋"),n=this.addInput(e,"强度","","0-10"),i=this.addTextarea(e,"触发","发生了什么"),a=this.addTextarea(e,"真实需要","我真正需要什么"),s=this.addTextarea(e,"我的回应","我怎么照顾自己或处理这件事");this.addSubmit(e,"保存情绪记录",async()=>{await this.plugin.addEmotionRecord({emotion:t.value,intensity:n.value,trigger:i.value,need:a.value,response:s.value});new o.Notice("情绪记录已保存。");this.goBack();await this.render()})};
b.prototype.renderKnowledgePanel=function(e){e.createEl("p",{text:"知识卡片会写入 LifeOS/10_知识库/ 下的独立 Markdown 文件。",cls:"lifeos-subtitle"});let t=this.addInput(e,"主题","","例如：间隔重复"),n=this.addInput(e,"分类","","学习方法 / AI / 心理学 / 编程"),i=this.addInput(e,"来源","","书籍、课程、文章或 URL"),a=this.addTextarea(e,"核心概念","这个知识点最核心的内容"),s=this.addTextarea(e,"我的理解","用自己的话解释"),r=this.addTextarea(e,"可应用场景","它可以用在哪里");this.addSubmit(e,"创建知识卡片",async()=>{await this.plugin.createKnowledgeNote({title:t.value,category:n.value,source:i.value,concept:a.value,understanding:s.value,application:r.value});new o.Notice("知识卡片已创建。");this.goBack();await this.render()})};
const oldGetPreviewConfig=b.prototype.getPreviewConfig;
b.prototype.getPreviewConfig=function(e){return{career:{title:"职业",recordLabel:"职业发展",recordPanel:"career"},emotion:{title:"情绪",recordLabel:"情绪与自我觉察",recordPanel:"emotion"},knowledge:{title:"知识库",recordLabel:"知识库",recordPanel:"knowledge"}}[e]||oldGetPreviewConfig.call(this,e)};
const oldRenderHomePreviews=b.prototype.renderHomePreviews;
b.prototype.renderHomePreviews=async function(e){await oldRenderHomePreviews.call(this,e);let t=new Set(this.plugin.settings.homePreviewPanels);t.has("career")&&await this.renderItemsPreview(e,"职业","08_职业发展","career_note","career");t.has("emotion")&&await this.renderModuleRecordCardPreview(e,"情绪","09_情绪与自我觉察","情绪记录.md","emotion");t.has("knowledge")&&await this.renderItemsPreview(e,"知识库","10_知识库","knowledge_note","knowledge")};
const oldPreviewDetail=b.prototype.renderPreviewDetailPanel;
b.prototype.renderPreviewDetailPanel=async function(e){if(this.previewTarget==="career")return await this.renderItemPreviewDetail(e,"08_职业发展","career_note");if(this.previewTarget==="emotion")return await this.renderModuleRecordPreview(e,"09_情绪与自我觉察","情绪记录.md");if(this.previewTarget==="knowledge")return await this.renderItemPreviewDetail(e,"10_知识库","knowledge_note");return oldPreviewDetail.call(this,e)};
const oldPreviewSettings=b.prototype.renderPreviewSettingsPanel;
b.prototype.renderPreviewSettingsPanel=function(e){oldPreviewSettings.call(this,e);let t=e.querySelector(".lifeos-preview-settings");if(!t||t.querySelector('[data-lifeos-extra-preview="career"]'))return;let n=new Set(this.plugin.settings.homePreviewPanels),i=[["career","职业预览"],["emotion","情绪预览"],["knowledge","知识库预览"]];for(let[a,s]of i){let r=t.createEl("label",{cls:"lifeos-preview-option"});r.dataset.lifeosExtraPreview=a;let l=r.createEl("input",{type:"checkbox"});l.checked=n.has(a);r.createSpan({text:s});l.addEventListener("change",async()=>{l.checked?n.add(a):n.delete(a);this.plugin.settings.homePreviewPanels=[...new Set([...this.plugin.settings.homePreviewPanels.filter(c=>!["career","emotion","knowledge"].includes(c)),...i.map(c=>c[0]).filter(c=>n.has(c))])];await this.plugin.saveSettings()})}};
})();

/* LifeOS unified cross-platform mobile utility drawer. Added by external AI on 2026-06-10. */
(()=>{if(globalThis.__lifeosUnifiedMobileUtilityDrawerPatch)return;globalThis.__lifeosUnifiedMobileUtilityDrawerPatch=!0;
const oldRenderEvolutionSidebar=b.prototype.renderEvolutionSidebar;
function isLifeOSMobile(){return document.body.classList.contains("is-mobile")||window.matchMedia("(max-width: 768px)").matches}
b.prototype.renderEvolutionSidebar=function(e){
  if(!isLifeOSMobile())return oldRenderEvolutionSidebar.call(this,e);
  this.utilityPanel=this.utilityPanel||"";
  let t=e.createDiv({cls:"lifeos-mobile-utility"});
  let n=t.createDiv({cls:"lifeos-mobile-utility-actions"});
  let h=new o.ButtonComponent(n).setButtonText("系统进化").onClick(()=>{this.utilityPanel=this.utilityPanel==="evolution"?"":"evolution";this.render()});
  this.utilityPanel==="evolution"&&h.setCta();
  let d=new o.ButtonComponent(n).setButtonText("AI 问答").onClick(()=>{this.utilityPanel=this.utilityPanel==="ai"?"":"ai";this.render()});
  this.utilityPanel==="ai"&&d.setCta();
  if(!this.utilityPanel)return;
  let i=t.createDiv({cls:"lifeos-mobile-utility-drawer"});
  let a=i.createDiv({cls:"lifeos-mobile-utility-header"});
  a.createEl("h3",{text:this.utilityPanel==="evolution"?"系统进化":"AI 问答"});
  new o.ButtonComponent(a).setIcon("x").setTooltip("收起").onClick(()=>{this.utilityPanel="";this.render()});
  if(this.utilityPanel==="evolution"){
    i.createEl("p",{text:"记录这个面板哪里不好用、想新增什么、希望外部 AI 怎么继续改。",cls:"lifeos-sidebar-desc"});
    let s=i.createEl("textarea",{cls:"lifeos-evolution-input",placeholder:"输入需要改进的问题..."});
    s.value=this.evolutionDraft||"";
    s.addEventListener("input",()=>{this.evolutionDraft=s.value});
    let r=i.createDiv({cls:"lifeos-actions"});
    new o.ButtonComponent(r).setButtonText("保存").setCta().onClick(async()=>{await this.plugin.addEvolutionIssue(s.value);s.value="";this.evolutionDraft="";this.utilityPanel="";new o.Notice("改进问题已写入系统自我进化文件。");await this.render()});
    new o.ButtonComponent(r).setButtonText("说明").onClick(()=>{this.utilityPanel="";this.navigate("evolution");this.render()});
    return;
  }
  i.createEl("p",{text:"AI 会读取 LifeOS 上下文。若回答包含受控写入块，插件只会在 LifeOS 文件夹内修改 Markdown。",cls:"lifeos-sidebar-desc"});
  let s=i.createEl("textarea",{cls:"lifeos-ai-input",placeholder:"问 AI，或让它修改 LifeOS 文档..."});
  s.value=this.aiDraft||"";
  s.addEventListener("input",()=>{this.aiDraft=s.value});
  let r=i.createDiv({cls:"lifeos-actions lifeos-ai-actions"});
  let l=i.createDiv({cls:"lifeos-ai-answer"});
  this.aiAnswerVisible?(l.show(),l.setText(this.aiAnswerText||"")):l.hide();
  new o.ButtonComponent(r).setButtonText("发送").setCta().onClick(async()=>{this.aiAnswerVisible=!0;this.aiAnswerText="正在思考...";l.show();l.setText(this.aiAnswerText);try{let c=await this.plugin.askAI(s.value);this.aiAnswerText=c||"没有收到回答。";l.setText(this.aiAnswerText);s.value="";this.aiDraft=""}catch(c){let u=c instanceof Error?c.message:String(c);this.aiAnswerText=`请求失败：${u}`;l.setText(this.aiAnswerText);new o.Notice("AI 请求失败，请检查 API 设置。")}});
  new o.ButtonComponent(r).setButtonText("记录").onClick(async()=>{let c=this.plugin.app.vault.getAbstractFileByPath(this.plugin.getAiLogPath());c instanceof o.TFile&&(this.close(),await this.plugin.app.workspace.getLeaf(!0).openFile(c))});
};
})();