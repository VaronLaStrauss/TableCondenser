# TableCondenser

This Table Condenser is a standalone class which filters, sorts, and paginates tabular data.

## Usage
To use this, simply create a new class by:
```
const table = document.getElementByTagName('table')[0];
const tbody = table.getElementByTagName('tbody');
const thead = table.getElementByTagName('thead');
const hasCheckboxes = false;
const tc = new TableCondenser(tbody, thead, hasCheckboxes);

tbody.replaceChildren(...tc.rows);
```

## Behavior
To edit the behavior, change which fields and columns are changed.
```
// Change the columns which need to be filtered
tc.filterColumns = [1,2,3];
// Change the filter
tc.filter = "Yans";

// Change the sort direction
tc.filter = "desc"; // defaults to 'asc'
// Set the sort column
tc.sortColumn = 3;

// Change the page
tc.nextPage();
tc.prevPage();
// Set how many entries will show
tc.limit = 10;
```

This class uses a table with checkboxes, and this listens for changes of *all* checkboxes at the `<thead>` and `<tbody>` levels.
By setting the 3rd constructor argument to `false`, the listeners won't be appended to the checkboxes.
However, when the 3rd constructor argument is `true`, you can set the `TableCondenser.cbxSelector` to a query selector of your choice
```
tc.cbxSelector = 'input[type="checkbox"].i-am-a-checkbox';
```

Supplement the call by calling `TableCondenser.rows` everytime you want to re-render the table. Do this when you change some of the parameters of the instance.
```
tbody.replaceChildren(...tc.rows);
```
