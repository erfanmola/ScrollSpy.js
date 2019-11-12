# [ScrollSpy.js](https://erfanmola.github.io/ScrollSpy.js/)
ScrollSpy is a pure, lightweight Javascript library which allows you detecting Elements enter/exit from the viewport and a built-in support for creating indicator for your elements.

For more info and control over the library you can [Read Documentations](https://erfanmola.github.io/ScrollSpy.js/).

It is actively supported and maintained by contributors, Feel free to contribute.

###Installation

####Include CSS
First include the stylesheet in your HTML head (Optional):
```html
<link rel="stylesheet" href="ScrollSpy.min.css">
```

####Include JS
Now include the JavaScript in your HTML footer :
```html
<script src="ScrollSpy.min.js"></script>
```


###Setup

####HTML Markup
Now let's create a HTML structure like below : 
```html
<div class="scrollspy" spy-title="Section Title">Content</div>
<div class="scrollspy" spy-title="Section Title">Content</div>
<div class="scrollspy" spy-title="Section Title">Content</div>
<div class="scrollspy" spy-title="Section Title">Content</div>
<div class="scrollspy" spy-title="Section Title">Content</div>
<div class="scrollspy" spy-title="Section Title">Content</div>

<div id="indicator"></div>
```

####Initializing with JS
Then, let's initialize the library for our markup :
```js
var spy = new ScrollSpy({
    contexts_class: 'scrollspy'
});
```

###Initializing Options
Here is a full list of options that can be passed to library while initializing :
```js
var spy = new ScrollSpy({
        contexts_class: 'scrollspy',
        delay: 200,
        callbackOnChange: function (el) { alert('Active Element Changed'); },
        callbackOnDestroy: function () { alert('ScrollSpy Distroyed !'); }
});
```

| Parameter | Description |
|-----------|-------------|
|contexts_class|class of the elements that need to be tracked by the library.|
|delay|time of delay between detecting scrolls, by default it's 200ms.|
|callbackOnChange|function that gets called each time when active element of the page changes.|
|callbackOnDestroy|function that gets called after calling the destroy method.|


###Indicator options
Also here is a full list of options that can be passed to library while initializing an indicator :
```js
spy.Indicator({
    element: document.getElementById('indicator'),
    indicator_container_class: 'scrollspy-indicator',
    indicator_item_class: 'scrollspy-indicator-item',
    clickable: true,
    forceActive: false,
});
```

| Parameter | Description |
|-----------|-------------|
| element | the element that will be used as indicator container. |
| indicator_container_class | class of the indicator's container. |
| indicator_item_class | class of the indicator's items. |
| clickable | specifies whether the indicator's items will be clickable, check [this demo](https://github.com/erfanmola/ScrollSpy.js/tree/master/test/EN/Demo%201). |
| forceActive | specifies whether the indicator must have an active element, check [this demo](https://github.com/erfanmola/ScrollSpy.js/tree/master/test/EN/Demo%202). |

#### TODO :
- [x] Initial Commit
- [x] Write basic README.md
- [x] Add Persian demos in test folder
- [x] Create page for library at github.io
- [x] Provide basic documentation in README.md
- [ ] Create Responsive stylesheet for Demos & Documentations Page
- [ ] Make library accessible as npm-package
- [ ] Add some developer-friendly comments in the code