# Dodona

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/thepieterdc.dodona-plugin-vscode.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=thepieterdc.dodona-plugin-vscode)

Plugin for Visual Studio Code to submit exercises to Dodona.

## Configuration
You can authenticate by creating an API token. Instructions on how to do so can be found [here](https://dodona-edu.github.io/guides/creating-an-api-token/). After you have generated a token, configure it in the settings:
![API token](assets/api-token.png)

## Usage
Add the url to the exercise as a comment on the first line of your solution and execute the `Submit to Dodona`-command by opening the command palette using `Ctrl-Shift-P`. 

![Submit](assets/submit.png)

## Example
```javascript
// https://dodona.ugent.be/nl/activities/1545120484/
function echo(i) {
    return i;
}
```

## Credits
- Plugin initially developed by [Pieter De Clercq](https://thepieterdc.github.io/).
