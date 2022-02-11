module.exports = {
  extends: [
    'stylelint-config-standard-scss', // configure for SCSS
    'stylelint-config-recommended-vue', // add overrides for .Vue files
    'stylelint-config-recess-order', // use the recess order for properties
    'stylelint-config-prettier' // turn off any rules that conflict with Prettier
  ],
  "plugins": [
    "stylelint-scss"
  ]
}
