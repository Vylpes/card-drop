# Cards

This document will describe how to add cards to the bot. This is from the
perspective of the development side and doesn't go into details of syncing
from an external place such as with the Google Drive Sync function.

The cards will be put into the `$DATA_DIR/cards` folder. `$DATA_DIR` is
configured in the `.env` file.

## Folder Structure

The general structure of the cards folder is as follows:

```
cards           # The main cards folder
| Series 1      # Series folder
| | BRONZE      # Type folder
| | | 1000.jpg  # Card image
| | | 1001.jpg
| | 1.json      # Card metadata file
| Series 2
| | SILVER
| | | 2000.jpg
| | 2.json
```

- The root of the cards folder will have a folder foor each series
- Each series will contain folders for each of the card types containing the
  card images.
- The series folder will also contain a metadata JSON folder containing the
  metadata of the cards within that series.

The bot when loading will search the cards folder recursively for each json,
and then read them to determine what cards should be used for the bot.

## Series Metadata

An example of what the metadata files could look like are as follows:

```json
[
    {
        "id": 1,
        "name": "Series 1",
        "cards": [
            {
                "id": "1000",
                "name": "Card 1000 of Series 1",
                "type": 1,
                "path": "Series 1/BRONZE/1000.jpg"
            },
            {
                "id": "1001",
                "name": "Card 1001 of Series 1",
                "type": 1,
                "path": "Series 2/BRONZE?1001.jpg",
                "subseries": "Custom Series Name"
            }
        ]
    }
]
```

This file will load a series called "Series 1" with the id of 1, containing 2
cards:
- Card 1000, with type 1 (Bronze), with its image located at (from root)
  "Series 1/BRONZE/1000.jpg"
- Card 1001 is the same, except has a custom "subseries" name which will
  override the main series name if shown, helpful for an "other" category.

### Card Type

<table>
    <thead>
        <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Chance</th>
            <th>Sacrifice Cost (Coins)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>0</td>
            <td>Unknown</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>1</td>
            <td>Bronze</td>
            <td>62%</td>
            <td>5</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Silver</td>
            <td>31%</td>
            <td>10</td>
        </tr>
        <tr>
            <td>3</td>
            <td>Gold</td>
            <td>4.4%</td>
            <td>30</td>
        </tr>
        <tr>
            <td>4</td>
            <td>Manga</td>
            <td>2%</td>
            <td>40</td>
        </tr>
        <tr>
            <td>5</td>
            <td>Legendary</td>
            <td>0.6%</td>
            <td>100</td>
        </tr>
    </tbody>
</table>
