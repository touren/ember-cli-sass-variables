# ember-cli-sass-variables-ex
Forked from https://github.com/davidpett/ember-cli-sass-variables

Access your SASS variables from your Ember app to keep things like style guides up to date.

* Support multiline variable declaration.

* Support [lists variable](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#lists).

## Install

Simply run `ember install ember-cli-sass-variables-ex`. If you don't already have `ember-cli-sass` installed, this will do it for you.

## Configure

Once installed, add a `.scss` file that only contains variables such as `app/styles/_variables.scss`.

Configure the addon in your `ember-cli-build.js` file by adding the path to your variables file:
```javascript
var app = new EmberApp(defaults, {
  sassVariables: 'app/styles/_variables.scss'
});
```

### Options
`appDir` - (defaults to `app`) Directory of your app code

`sassVariables` - path to a `.scss` file containing variables

## Usage

Once configured you can access the Array containing the variables like so:
```javascript
import Ember from 'ember';
import sassVariables from '../utils/sass-variables';

export default Ember.Component.extend({
  sassVariables
});
```

The Array contains objects with key/value pairs. In your SASS file, you might have:
```scss
$color-red: #FF4136;
$color-blue: #357EDD;
$font-serif: 'Scope One', serif;
$font-list: (
  (red, 32px),
  (black, 16px)
);
```

And the Equivalent in javascript would be:
```javascript
[
  {
    key: 'colorRed',
    value: '#FF4136'
  }, {
    key: 'colorBlue',
    value: '#357EDD'
  }, {
    key: 'fontSerif',
    value: '"Scope One", serif'
  }, {
    key: 'fontList',
    value: [['red', '32px'],['black','16px']]
  }

]
```

The addon will watch to see if the variables file has changed and automatically update the javascript file with the correct information.

Inspiration and some code from https://github.com/nordnet/sass-variable-loader
