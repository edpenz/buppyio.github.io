## buppyio/bpy dependency

Generating the command docs depends on the source of the [buppyio/bpy](https://github.com/buppyio/bpy) tool itself. The ~~~GOPATH~~~ environment variable should be set such that the bpy git repo is located in ~~~GOPATH/src/github.com/buppyio/bpy/~~~.

## Building

Parts of the buppy.io site are generated using a node/gulp based toolchain. The following steps outline the process for setting up and performing a minimal build.

1. Obtain [Node.js](https://nodejs.org/en/download/) for your platform and ensure that its tools are available from a terminal.
2. Ensure that the [buppyio/bpy git repo](https://github.com/buppyio/bpy) is available as outlined above.
3. Clone this repo and open a terminal in its root folder.
4. Install Node.js dependencies by running ~~~npm install~~~.
5. Run a default gulp build using the command ~~~npm run build~~~.

Gulp should also be installed globally (~~~npm install -g gulp~~~) for easier access to the specialised build commands.
