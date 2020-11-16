# Dodona

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version-short/thepieterdc.dodona-plugin-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=thepieterdc.dodona-plugin-vscode)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/thepieterdc.dodona-plugin-vscode.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=thepieterdc.dodona-plugin-vscode)

Extension for Visual Studio Code to submit exercises to [Dodona](https://dodona.ugent.be/).

## Install the Dodona extension

1. <img src="assets/extensions-view-icon.png" alt="Extensions" width=30px; /> Extensions (`Ctrl+Shift+X`)
2. Search for **Dodona**
3. `Install`

## Insert API token (Configuration)

You can authenticate by creating an API token. Using such token, VS Code can submit solution on your behalf without needing your password. Instructions on how to do so can be found [here](https://dodona-edu.github.io/guides/creating-an-api-token/). After you have generated a token, configure it in the settings (`Ctrl+,` > `dodona.auth.dodona`):

1. <img src="assets/sideview.png" alt="cogwheel" width=30px;/> Dodona icon in the Activity Bar (icon in left column)
2. `Open Settings`
![API token](assets/api-token2.png)
3. Paste the API token you just made in text box.
4. In the left column you get an overview of the exercise series of the course (expand it if necessary).
![API token](assets/api-token3.png)

## Creating new exercises via Dodona extension (Usage)

1. <img src="assets/sideview.png" alt="sideview" width=30px;/> Dodona icon in the Activity Bar (icon in left column).
2. Select your course, series, and exercise in the tree.
3. Left-click on an exercise to open it in the editor. In the settings (`dodona.exercise.description.auto`) you can adjust if you want to open the activity description at the same time or not.
4. VS Code will now automatically create a new file in which you can write your solution.

<img src="assets/sideview-example.png" alt="sideview-example"/>

The first line of the newly created file will contain the link to the selected exercise as a comment. The Dodona extension uses this line to submit to the correct exercise, so don't remove it. If you hold `ctrl` (or `cmd` on a mac) while clicking the URL, the exercise description will open in a new browser window.

> **Example**
>
> ```javascript
> // https://dodona.ugent.be/nl/activities/1545120484/
> function echo(i) {
>     return i;
> }
> ```

## Submit exercises via Dodona extension (Usage)

Once you've solved the exercise, it's easy to submit your solution. Execute the `Dodona: Submit solution`-command by opening the command palette using `Ctrl+Shift+P` by typing (parts of) `Dodona: Submit solution` and pressing `Enter`. You can also use the `Alt+D` shortcut (`Option-D` for Mac users) for this. You can also assign a [different shortcut](https://code.visualstudio.com/docs/getstarted/keybindings#_keyboard-shortcuts-editor). This command will submit your code to Dodona and trigger an automatic test.

![Submit](assets/submit2.png)

After a few seconds, you should see a popup in the bottom right corner containing the result of your submission. If you click the `View results` button, the result should open in a new browser window.

## Credits

-   Extension initially developed by [Pieter De Clercq](https://thepieterdc.github.io/)
-   Functionality vastly extended by [Stijn De Clercq](https://github.com/stijndcl)
