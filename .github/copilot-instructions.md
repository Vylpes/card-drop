# Card Drop Project - GitHub Copilot Instructions

## Project Overview
Card Drop is a Discord bot built with TypeScript and Discord.js v14 that allows users to drop, claim, and collect random cards in Discord channels. Cards have different rarities (Bronze, Silver, Gold, etc.) with weighted drop chances. The project uses TypeORM for database management with MySQL.

## Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Discord.js v14
- **Database**: TypeORM 0.3.24 with MySQL
- **Testing**: Jest with ts-jest
- **Linting**: ESLint with TypeScript ESLint
- **Build**: TypeScript Compiler (tsc)
- **Package Manager**: Yarn

## Project Structure

### Source Code (`/src`)
- `bot.ts` - Main entry point, initializes client and validates environment
- `client/` - Core client implementation and event handlers
  - `client.ts` - CoreClient class extending Discord.js Client
  - `events.ts` - Discord event handlers
  - `interactionCreate/` - Interaction handlers (commands, buttons, dropdowns)
  - `appLogger.ts` - Winston-based logging system
- `commands/` - Slash command implementations
  - Each command extends the `Command` abstract class
  - Must implement `execute(interaction: ChatInputCommandInteraction)`
  - Use SlashCommandBuilder for command definitions
- `buttonEvents/` - Button interaction handlers
  - Each button event extends `ButtonEvent` abstract class
  - Must implement `execute(interaction: ButtonInteraction)`
- `stringDropdowns/` - String dropdown interaction handlers
- `database/` - TypeORM configuration and entities
  - `entities/app/` - Database entity models
  - `migrations/app/` - Database migrations organized by version (e.g., 0.1, 0.2, 0.6, 0.9)
  - `dataSources/appDataSource.ts` - TypeORM DataSource configuration
- `helpers/` - Utility functions and helper classes
- `constants/` - Application constants (card rarities, error messages, embed colors)
- `contracts/` - TypeScript interfaces and type definitions
- `timers/` - Scheduled tasks (cron jobs)
- `Functions/` - Reusable function modules
- `registry.ts` - Registers commands, button events, and dropdowns

### Tests (`/tests`)
- Mirrors `src/` structure
- Uses Jest with mocking (jest-mock-extended)
- Test files follow pattern: `*.test.ts`
- Mock Discord.js interactions for testing

### Database (`/database`)
- Organized by version folders (0.1, 0.1.5, 0.2, 0.6, 0.9)
- Migrations are SQL files
- The TypeORM migration files (in TypeScript) are stored in `src/database/migrations/app/...`
- Uses `MigrationHelper.ts` class to generate the Up/Down functions

### Documentation (`/docs`)
- `cards.md` - Card system documentation
- `google-drive-sync.md` - GDrive sync feature
- `logger.md` - Logging system documentation

## Code Style & Patterns

### TypeScript Configuration
- Target: ES6
- Module: CommonJS
- Strict mode enabled
- Experimental decorators enabled (for TypeORM)
- Output directory: `./dist`

### ESLint Rules
- Camelcase naming required
- 1TBS brace style
- No trailing commas
- Arrow functions: prefer concise syntax
- Prefer const over let, no var
- Prefer template literals over string concatenation

### Common Patterns

#### Command Structure
```typescript
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";

export default class CommandName extends Command {
    constructor() {
        super();
        this.CommandBuilder = new SlashCommandBuilder()
            .setName("commandname")
            .setDescription("Description");
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        // Implementation
    }
}
```

#### Button Event Structure
```typescript
import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";

export default class ButtonEventName extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        // Implementation
    }
}
```

#### Entity Structure
```typescript
import { Column, Entity } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";

@Entity()
export default class EntityName extends AppBaseEntity {
    constructor(/* params */) {
        super();
        // Initialize properties
    }

    @Column()
        PropertyName: string;

    // Methods
}
```

#### Migration Structure
```typescript
import { MigrationInterface, QueryRunner } from "typeorm";
import MigrationHelper from "../../../../helpers/MigrationHelper";

export class MigrationName1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up("1234567890-MigrationName", "0.x", [
            "01-table/TableName",
        ], queryRunner);
    }

    public async down(): Promise<void> {
    }
}
```

## Database Entities
Key entities include:
- `User` - Discord user with currency tracking
- `Inventory` - User's card collection
- `Claim` - Active card claims (with 5-minute claim window)
- `Config` - Bot configuration settings
- `UserEffect` - User effects/power-ups

All entities extend `AppBaseEntity` which provides common fields (Id, WhenCreated, WhenUpdated) and base methods.

## Environment Configuration
Required environment variables (defined in `.env`):
- `BOT_TOKEN` - Discord bot token
- `BOT_VER`, `BOT_AUTHOR`, `BOT_OWNERID`, `BOT_CLIENTID` - Bot metadata
- `BOT_ENV` - Environment type (see `Environment` enum)
- `BOT_ADMINS` - Comma-separated admin user IDs
- `DATA_DIR` - Data directory path (for cards, logs, etc.)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_AUTH_USER`, `DB_AUTH_PASS` - Database connection
- `DB_SYNC` - Enable TypeORM auto-sync (use carefully)
- `DB_LOGGING` - Enable SQL query logging
- `EXPRESS_PORT` - Express server port (for webhooks)

## Testing Guidelines
- Mock external dependencies (Discord.js, TypeORM entities)
- Use `jest-mock-extended` for complex mocking
- Test file structure mirrors source structure
- Use `GenerateCommandInteractionMock()` helper for Discord interaction mocks
- Mock static methods on entities (e.g., `User.FetchOneById`)

## Key Features & Business Logic
- **Card System**: Cards organized by series, each with metadata (ID, name, rarity, path)
- **Drop Mechanics**: Random card drops based on weighted rarity chances
- **Claim System**: 5-minute exclusive claim window for drop initiator
- **Currency**: Users have currency, drops cost currency to initiate
- **Effects**: Power-ups/effects that users can acquire and use
- **Safe Mode**: Config option to disable drops for maintenance
- **Google Drive Sync**: Optional rclone integration for card asset sync

## Scripts
- `yarn build` - Compile TypeScript to JavaScript
- `yarn start` - Run the bot
- `yarn test` - Run Jest tests
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Auto-fix ESLint issues
- `yarn db:up` - Run pending migrations
- `yarn db:down` - Revert last migration
- `yarn db:create` - Create new migration file

## Logging
Uses Winston with:
- Console transport
- Daily rotating file transport
- Optional Discord webhook transport
- Centralized through `AppLogger` class
- Log levels: error, warn, info, debug

## Important Notes
- Commands are registered dynamically via `Registry.RegisterCommands()`
- Button events and dropdowns also registered via Registry
- `CoreClient.AllowDrops` flag controls whether drops are enabled
- Card metadata loaded from JSON files in `DATA_DIR/cards`
- Migration files organized by version folders
- All database operations should use TypeORM repositories
- Error messages centralized in `constants/ErrorMessages.ts`
- Card constants (starting currency, costs) in `constants/CardConstants.ts`

## When Creating New Features
1. **New Command**: Create in `src/commands/`, extend `Command`, register in `registry.ts`
2. **New Button Event**: Create in `src/buttonEvents/`, extend `ButtonEvent`, register in `registry.ts`
3. **New Entity**: Create in `src/database/entities/app/`, use TypeORM decorators
4. **New Migration**: Use `yarn db:create`, implement in version-specific folder
5. **Tests**: Create corresponding test file in `tests/` with same path structure
6. **Constants**: Add to appropriate file in `src/constants/`
7. **Documentation**: Update relevant files in `docs/` if feature is user-facing

## Minimal Code Changes Philosophy
- Only modify what's necessary to implement the requested feature
- Don't refactor working code unless specifically asked
- Keep existing patterns and conventions
- Validate changes don't break existing functionality
- Run linter and tests after changes
