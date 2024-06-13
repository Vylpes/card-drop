import { Interaction } from "discord.js";
import User from "../../../database/entities/app/User";
import CardConstants from "../../../constants/CardConstants";
import AppLogger from "../../appLogger";

export default async function NewUserDiscovery(interaction: Interaction) {
    const existingUser = await User.FetchOneById(User, interaction.user.id);

    if (existingUser) return;

    const newUser = new User(interaction.user.id, CardConstants.StartingCurrency);
    await newUser.Save(User, newUser);

    AppLogger.LogInfo("NewUserDiscovery", `Discovered new user ${interaction.user.id}`);
}