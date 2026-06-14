# Life Manager Dashboard

Life Manager Dashboard is a visual life management system for Obsidian.

It uses Markdown files as a local database and provides a floating visual panel for daily records, tasks, goals, projects, learning, health, finance, relationships, reviews, career development, emotions, knowledge notes, and system evolution notes.

## Features

- Visual dashboard for managing LifeOS notes without editing Markdown directly.
- Dedicated `LifeOS/` database folder inside the current vault.
- Daily records, tasks, goals, projects, learning, health, finance, relationships, reviews, career development, emotion tracking, and knowledge cards.
- Mobile-friendly layout for Obsidian Mobile.
- Optional AI assistant settings for OpenAI-compatible APIs.

## Data Storage

Life Manager Dashboard writes Markdown files inside the configured database folder. The default folder is:

```text
LifeOS/
```

The plugin is designed to keep LifeOS data separate from the rest of your vault.

## AI And Privacy

The AI assistant is optional and disabled until the user adds API settings.

If configured, the plugin may send selected LifeOS context from the `LifeOS/` database folder to the configured OpenAI-compatible API endpoint. The API URL, model, and key are controlled by the user in plugin settings.

Do not enter an API key unless you trust the configured provider.

## Installation

### Community Plugin Directory

After this plugin is accepted into the Obsidian community plugin directory, install it from:

```text
Settings -> Community plugins -> Browse
```

### Manual Installation

Copy these files into your vault:

```text
.obsidian/plugins/lifeos/
```

Required files:

```text
main.js
manifest.json
styles.css
```

Then restart Obsidian and enable LifeOS in Community plugins.

## Mobile

Life Manager Dashboard supports Obsidian Mobile. On mobile and narrow screens, the system evolution and AI areas collapse into bottom buttons to keep the main panel readable.

## License

MIT
