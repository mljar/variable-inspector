# Variable Inspector

The Variable Inspector is a Jupyter Notebook extension designed to help you manage and track variables within your notebook. It displays all your variables in one convenient location, allowing you to see their names, values, types, shapes, and sizes in real-time. This feature makes it easier to work without the need to manually print or check your variables.

## Features

### Selecting displayed columns

You can select which properties of the variables you'd like to display:

![cols](https://github.com/user-attachments/assets/d282fdac-491d-4890-af07-fce5dbdaa27a)

### Automatically refresh

The list of variables will automatically update whenever you edit or add new items. However, if you want to save memory processes, you can choose the Manual Refresh option to update the list at your convenience.

![image](https://github.com/user-attachments/assets/281eec42-a227-434d-bb36-028a10e8338c)

### Handling large variables

If you work with large variables like lists or DataFrames that don't fit in a table, you can display them in a separate panel with only one click:

![image](https://github.com/user-attachments/assets/fea0d038-f674-4148-8c0b-039bea8a34d2)

### Dark theme

If you prefer a darker look, a Dark Theme is also available!

![image](https://github.com/user-attachments/assets/e9b4356a-68dc-4ee9-84bf-de4944466301)

## Variable Inspector requirements

- JupyterLab >= 4.0.0

## Install extension

To install the extension, execute:

```bash
pip install variable_inspector
```

## Uninstall extension

To remove the extension, execute:

```bash
pip uninstall variable_inspector
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the variable_inspector directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall variable_inspector
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `variable-inspector` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)
