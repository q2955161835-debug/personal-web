import type { NextConfig } from "next";

const githubPagesBasePath = "/personal-web";
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

const githubPagesConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: githubPagesBasePath,
  assetPrefix: `${githubPagesBasePath}/`,
  images: {
    unoptimized: true,
  },
};

const nextConfig: NextConfig = isGithubPagesBuild ? githubPagesConfig : {};

export default nextConfig;
