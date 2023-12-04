function initializeCF() {
    $('#modal-toggle').on('click', handleCohortFinderClick);
    $('#cf-params-modal form').on('submit', handleCohortFinderSubmitTEST);
}

function handleCohortFinderClick(event) {
    $('#cf-params-modal').modal('toggle');
}

function handleCohortFinderSubmit(event) {
    event.preventDefault();

    // get the form data
    var formData = new FormData(event.target);

    // create a JSON strong from entries, if needed
    // JSON.stringify(Object.fromEntries(formData));

    // get relevant form data
    var params = {
        'numClusters': formData.get('numClusters'),
        'testSetPercent': formData.get('testSetPercent'),
        'featuresSelected': formData.getAll('featuresSelected')
    };

    // call the run_cohort_finder endpoint with the form data
    $.ajax({
		url: "/run_cohort_finder",
		type: "GET",
		async: true,
        data: params,
        beforeSend: function() {
            $('#cf-params-modal').modal('toggle');
            console.log("waiting for cohort finder results...")
            // $('#cf-progress-modal').modal('toggle');
        },
		success: handleCohortFinderResponse
		}
	);

}

function handleCohortFinderResponse(data) {
    console.log("received cohort finder results:")
    console.log(data)
    renderToolSelection();
    renderScatterPlot(data);
}

function handleCohortFinderSubmitTEST(event) {
    event.preventDefault();
    const data = {
        'embed_x': [1,2,3,4,5],
        'embed_y': [1,2,3,4,5],
        'groupid': [1,1,2,3,3],
        'testind': [0,0,0,0,1]
    };

    handleCohortFinderResponse(data);
}
