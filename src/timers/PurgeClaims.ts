import AppLogger from "../client/appLogger";
import Claim from "../database/entities/app/Claim";

export default async function PurgeClaims() {
    const claims = await Claim.FetchAll(Claim);

    const whenLastClaimable = new Date(Date.now() - (1000 * 60 * 5)); // 5 minutes ago

    const expiredClaims = claims.filter(x => x.WhenCreated < whenLastClaimable);

    await Claim.RemoveMany(Claim, expiredClaims);

    AppLogger.LogInfo("Timers/PurgeClaims", `Purged ${expiredClaims.length} claims from the database`);
}