Popeye
======

Anchor navigation animated

## Default use
```javascript
var popeye = new Popeye('nav a');
```

## Whitin an element
```javascript
var popeye = new Popeye({
        'navigate': 'nav.popeye-within-relative a',
        'within': 'div.popeye-within-relative'
    });
```

## Todo
* Test in browsers
* Analyze/Do auto animation on hased URL
* Listen the onhashchange event