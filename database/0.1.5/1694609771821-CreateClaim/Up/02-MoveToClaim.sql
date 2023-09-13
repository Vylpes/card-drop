INSERT INTO claim (
    Id,
    WhenCreated,
    WhenUpdated,
    ClaimId,
    InventoryId
)
SELECT
    UUID(),
    NOW(),
    NOW(),
    ClaimId,
    Id
FROM inventory;