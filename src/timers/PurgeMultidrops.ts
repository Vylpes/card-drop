import AppLogger from "../client/appLogger";
import CardConstants from "../constants/CardConstants";
import Multidrop from "../database/entities/app/Multidrop";

export default async function PurgeMultidrops() {
    const multidrops = await Multidrop.FetchAll(Multidrop);
    const whenLastActive = new Date(Date.now() - CardConstants.MultidropExpiry);
    const expiredMultidrops = multidrops.filter(x => x.WhenUpdated < whenLastActive);

    await Multidrop.RemoveMany(Multidrop, expiredMultidrops);

    AppLogger.LogInfo("Timers/PurgeMultidrops", `Purged ${expiredMultidrops.length} multidrops from the database`);
}
