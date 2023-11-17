function renderLines() {
	///////////////////////////// PARCOORDS SETUP /////////////////////////////
	const margin = visualViewport.height * 0.05;
	const parcoords_card_height = visualViewport.height * 0.3 - margin;
	// $("#parcoords-parent").height(parcoords_card_height)
	var parcoords = ParCoords()("#example")
		.alpha(0.4)
		.mode("queue") // progressive rendering
		.height(parcoords_card_height)

	// slickgrid needs each data element to have an id
	ORIGINAL_DATASET.forEach(function (d, i) { d.id = d.id || i; });
	parcoords
		.data(ORIGINAL_DATASET)
		.hideAxis(["case_name", "gid"])
		.render()
		.reorderable()
		.brushMode("1D-axes");
	


	///////////////////////////// SLICK GRID SETUP /////////////////////////////
	var column_keys = d3.keys(ORIGINAL_DATASET[0]);
	var columns = column_keys.map(function (key, i) {
		return {
			id: key,
			name: key,
			field: key,
			sortable: true
		}
	});

	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false,
		multiColumnSort: false,
	};

	var dataView = new Slick.Data.DataView();
	var grid = new Slick.Grid("#grid", dataView, columns, options);
	var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

	// dataView subscriptions drive the grid
	dataView.onRowCountChanged.subscribe(function (e, args) {
		grid.updateRowCount();
		grid.render();

		// update the image pane when the paging changes
		updateImageView(dataView);

	});

	dataView.onRowsChanged.subscribe(function (e, args) {
		grid.invalidateRows(args.rows);
		grid.render();

		updateImageView(dataView);
	});


	// column sorting
	var sortcol = column_keys[0];
	var sortdir = 1;

	function comparer(a, b) {
		var x = a[sortcol], y = b[sortcol];
		return (x == y ? 0 : (x > y ? 1 : -1));
	}

	// click header to sort grid column
	grid.onSort.subscribe(function (e, args) {
		sortdir = args.sortAsc ? 1 : -1;
		sortcol = args.sortCol.field;

		if ($.browser.msie && $.browser.version <= 8) {
			dataView.fastSort(sortcol, args.sortAsc);
		} else {
			dataView.sort(comparer, args.sortAsc);
		}
	});

	// highlight row in chart
	grid.onMouseEnter.subscribe(function (e, args) {
		// Get row number from grid
		var grid_row = grid.getCellFromEvent(e).row;

		// Get the id of the item referenced in grid_row
		var item_id = grid.getDataItem(grid_row).id;
		var d = parcoords.brushed() || ORIGINAL_DATASET;

		// Get the element position of the id in the data object
		elementPos = d.map(function (x) { return x.id; }).indexOf(item_id);

		// Highlight that element in the parallel coordinates graph
		parcoords.highlight([d[elementPos]]);
	});

	grid.onMouseLeave.subscribe(function (e, args) {
		parcoords.unhighlight();
	});


	// fill grid with data
	gridUpdate(ORIGINAL_DATASET);

	// update grid on brush
	parcoords.on("brush", function (d) {
		gridUpdate(d);
		
		// TODO image gallary update

	});
	
	function gridUpdate(data) {
		dataView.beginUpdate();
		dataView.setItems(data);
		dataView.endUpdate();
	};

	///////////////////////////// IMAGE GALLERY SETUP /////////////////////////////
	//set default page size to 25 or else pageSize will be 0.
	initializeImageView(dataView);
	
	return dataView;
}