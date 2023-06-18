{
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem
    (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.pnpm
            nodePackages."@astrojs/language-server"
            nodePackages.typescript-language-server
            nodePackages.vscode-langservers-extracted
            nodePackages."@tailwindcss/language-server"
          ];
        };
      }
    );
}
