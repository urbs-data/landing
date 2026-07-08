import { m } from "#/paraglide/messages";

export const socialAssetKeys = ["linkedin", "meet"] as const;

export type SocialAssetKey = (typeof socialAssetKeys)[number];

export const socialAssetFiles = {
  linkedin: {
    sourcePath: "/assets/social/linkedin.png",
    filename: "urbs-linkedin-cover.png",
    contentType: "image/png",
  },
  meet: {
    sourcePath: "/assets/social/meet.png",
    filename: "urbs-meet-background.png",
    contentType: "image/png",
  },
} satisfies Record<
  SocialAssetKey,
  {
    sourcePath: string;
    filename: string;
    contentType: string;
  }
>;

export function getSocialAssetCatalog() {
  return [
    {
      key: "linkedin",
      name: m.social_asset_linkedin_cover_name(),
      description: m.social_asset_linkedin_cover_description(),
      dimensions: m.social_asset_linkedin_cover_dimensions(),
      format: "PNG",
      previewPath: socialAssetFiles.linkedin.sourcePath,
      downloadPath: "/api/social/assets/linkedin",
    },
    {
      key: "meet",
      name: m.social_asset_meet_background_name(),
      description: m.social_asset_meet_background_description(),
      dimensions: m.social_asset_meet_background_dimensions(),
      format: "PNG",
      previewPath: socialAssetFiles.meet.sourcePath,
      downloadPath: "/api/social/assets/meet",
    },
  ] satisfies {
    key: SocialAssetKey;
    name: string;
    description: string;
    dimensions: string;
    format: string;
    previewPath: string;
    downloadPath: string;
  }[];
}

export function isSocialAssetKey(key: string): key is SocialAssetKey {
  return socialAssetKeys.some((assetKey) => assetKey === key);
}
