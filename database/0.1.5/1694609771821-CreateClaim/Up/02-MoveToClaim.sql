INSERT INTO claim (
    Id,
    ClaimId,
    InventoryId
)
SELECT
    UUID(),
    ClaimId,
    Id
FROM inventory;