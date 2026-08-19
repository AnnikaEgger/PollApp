# Pollapp

An Angular application for creating surveys and collecting votes in real time.

![Pollapp landing page preview](assets/images/readme-preview.png)

## Quick start

### Prerequisites

- Node.js and npm
- A configured Supabase project

### Installation

```bash
npm install
npm run start
npm run build
```

### Supabase Configuration

The Supabase connection settings are located in src/environments/environment.ts.
Before connecting the application to your own Supabase project, add your project URL and API key:

```bash
export const env = {
supabase_url: '',
supabase_key: '',
};
```

## Key features

- Create surveys with categories, descriptions, multiple questions, and end dates
- Support single- and multiple-choice questions
- Browse surveys by category and view live voting results
- Built with a modular, component-based architecture
- Powered by Supabase for data storage and real-time updates

## Tech stack

- [Angular](https://angular.dev/) 22
- Angular Reactive Forms
- TypeScript 6
- [Supabase](https://supabase.com/)
- SCSS

## Project structure

```text
public/
└── assets/                  # Fonts, icons, UI images, and preview image

src/
├── app/
│   ├── core/
│   │   ├── interfaces/      # Survey, question, option, and vote types
│   │   └── services/        # Supabase access and application services
│   ├── features/             # Reusable survey, question, option, and result UI
│   ├── pages/                # Landing, survey, and survey creation pages
│   ├── shared/               # Shared components, constants, pipes, and models
│   ├── app.config.ts         # Application providers
│   ├── app.routes.ts         # Route definitions
│   └── app.ts                # Root component
├── environments/             # Environment-specific configuration
├── styles/                   # Global SCSS design system and layout styles
├── index.html
└── main.ts                   # Application entry point

angular.json                 # Angular CLI configuration
package.json                 # Scripts and dependencies
```
