# Changelog

## 0.10.0

### New Features
- Added effects to increase the chance of getting gold, legendary, and manga cards (#456)
	- These double the chosen rarity’s rate and reduce the others accordingly
- `/multidrop` now shows a summary when it finishes, including what was kept, what was sacrificed, and your new balance (#383)

### Improvements
- The unclaimed-card effect chance is now based on how much of the card pool you still need, with configured min/max bounds instead of a flat 50% (#455)
- `/series list` now shows claim progress per series (e.g. `(30/40)`) (#295)
- Card metadata loading activates safe mode if a series/card object is undefined (#473)
- Logger output is capped at debug/verbose (#364)
- Dependency updates and security patches (#445, #458, #459, #460, #461, #462, #463)
- Fixed the Forgejo Actions deploy workflow when `rsync` was missing (#488)

### Documentation
- Added documentation on how to set up the logger (#271)
