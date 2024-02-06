import { LensClient, production, ProfileFragment } from "@lens-protocol/client";

export const getHandles = async (address: string): Promise<ProfileFragment[]> => {
  const lensClient = new LensClient({
    environment: production
  });
  const allOwnedProfiles = await lensClient.profile.fetchAll({
    where: { ownedBy: [address] },
  })
  return allOwnedProfiles.items

}
