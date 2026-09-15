# Effects

Effects are temporary boosts that users can purchase and activate to modify their card drop rates. Only one effect can be active at a time.

## Available Effects

### Unclaimed Chance Up
- **Cost**: 100 Currency
- **Duration**: 10 minutes
- **Cooldown**: 3 hours
- **Effect**: 50% chance to drop a card that the user has not yet claimed

### Gold Chance Up
- **Cost**: 150 Currency
- **Duration**: 10 minutes
- **Cooldown**: 3 hours
- **Effect**: Doubles the drop rate of Gold cards (from 4.4% to 8.8%)

### Legendary Chance Up
- **Cost**: 200 Currency
- **Duration**: 10 minutes
- **Cooldown**: 3 hours
- **Effect**: Doubles the drop rate of Legendary cards (from 0.6% to 1.2%)

### Manga Chance Up
- **Cost**: 150 Currency
- **Duration**: 10 minutes
- **Cooldown**: 3 hours
- **Effect**: Doubles the drop rate of Manga cards (from 2% to 4%)

## How Rarity Chance Effects Work

When a rarity chance effect is active (Gold, Legendary, or Manga), the bot adjusts drop rates as follows:

1. The target rarity's drop rate is **doubled**
2. The increased percentage is subtracted equally from the other four rarities

### Example: Gold Chance Up

Base drop rates:
- Bronze: 62%
- Silver: 31%
- Gold: 4.4%
- Manga: 2%
- Legendary: 0.6%

With Gold Chance Up active:
- Gold doubled: 4.4% × 2 = **8.8%**
- Increase: 8.8% - 4.4% = 4.4%
- Reduction per other rarity: 4.4% ÷ 4 = 1.1%

Final rates:
- Bronze: 62% - 1.1% = **60.9%**
- Silver: 31% - 1.1% = **29.9%**
- Gold: **8.8%** (doubled)
- Manga: 2% - 1.1% = **0.9%**
- Legendary: 0.6% - 1.1% = **-0.5%** (effectively 0% or minimum)

### Example: Legendary Chance Up

With Legendary Chance Up active:
- Legendary doubled: 0.6% × 2 = **1.2%**
- Increase: 1.2% - 0.6% = 0.6%
- Reduction per other rarity: 0.6% ÷ 4 = 0.15%

Final rates:
- Bronze: 62% - 0.15% = **61.85%**
- Silver: 31% - 0.15% = **30.85%**
- Gold: 4.4% - 0.15% = **4.25%**
- Manga: 2% - 0.15% = **1.85%**
- Legendary: **1.2%** (doubled)

### Example: Manga Chance Up

With Manga Chance Up active:
- Manga doubled: 2% × 2 = **4%**
- Increase: 4% - 2% = 2%
- Reduction per other rarity: 2% ÷ 4 = 0.5%

Final rates:
- Bronze: 62% - 0.5% = **61.5%**
- Silver: 31% - 0.5% = **30.5%**
- Gold: 4.4% - 0.5% = **3.9%**
- Manga: **4%** (doubled)
- Legendary: 0.6% - 0.5% = **0.1%**

## Usage

1. Purchase effects using the `/effects buy` command
2. Activate an effect using the `/effects use` command
3. Check your active effect with `/effects list`
4. Only one effect can be active at a time
5. After an effect expires, it enters a cooldown period before it can be used again

## Technical Details

The effect logic is implemented in:
- `src/helpers/DropHelpers/GetCardsHelper.ts` - Drop rate calculation
- `src/helpers/EffectHelper.ts` - Effect management
- `src/constants/EffectDetails.ts` - Effect configuration
- `src/database/entities/app/UserEffect.ts` - Database entity

When a card is dropped, the system:
1. Checks if the user has an active rarity chance effect
2. If yes, adjusts the drop rates accordingly
3. Performs the random selection using the adjusted rates
4. Returns the selected card
