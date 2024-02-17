
{
  description = "A simple Python project with NumPy and other packages";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixgl.url = "github:guibou/nixGL";
    nixgl.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, nixgl }: {
    devShells = {
      x86_64-linux = let
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
      in {
        # Devshell 1 with NumPy and Matplotlib
        flask = pkgs.mkShell {
          buildInputs = [
            pkgs.python3
            pkgs.python3Packages.requests
            pkgs.python3Packages.flask
          ];
          shellHook = ''
            export PYTHONSTARTUP=.homework1/startup.py
          '';
        };
      };
    };
  };
}
