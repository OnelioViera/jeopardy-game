const BASE_API_URL = "https://jservice.io/api/"; // The base URL for the API.
const NUM_CATEGORIES = 6; // The number of categories to fetch.
const NUM_CLUES_PER_CAT = 5; // The number of clues per category to display.


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",h
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = []; // Initialize an empty array to store categories.

async function getCategoryIds() {
    let response = await axios.get(`${BASE_API_URL}categories?count=100`); // Fetch category IDs from the API.
    let catIds = response.data.map(c => c.id); // Extract the IDs from the response data.
    return _.sampleSize(catIds, NUM_CATEGORIES); // Return a random sample of category IDs.
}

async function getCategory(catId) {
    let response = await axios.get(`${BASE_API_URL}category?id=${catId}`); // Fetch category data for a specific ID.
    let cat = response.data; // Extract the category object from the response.
    let allClues = cat.clues; // Get all the clues for the category.
    let randomClues = _.sampleSize(allClues, NUM_CLUES_PER_CAT); // Select a random sample of clues.
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    })); // Format the clues with question, answer, and showing status.

    return { title: cat.title, clues }; // Return the formatted category object.
}

async function fillTable() {
    $("#jeopardy thead").empty(); // Clear the table header.

    let $tr = $("<tr>"); // Create a new table row element.

    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
        $tr.append($("<th>").text(categories[catIdx].title)); // Add a table header cell for each category.
    }

    $("#jeopardy thead").append($tr); // Append the table row to the table header.

    $("#jeopardy tbody").empty(); // Clear the table body.

    for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
        let $tr = $("<tr>"); // Create a new table row element.

        for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
            $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?")); // Add a table data cell with a unique ID for each clue.
        }

        $("#jeopardy tbody").append($tr); // Append the table row to the table body.
    }
}

function handleClick(evt) {
    let id = evt.target.id; // Get the ID of the clicked element.
    let [catId, clueId] = id.split("-"); // Split the ID to get the category ID and clue ID.
    let clue = categories[catId].clues[clueId]; // Get the corresponding clue object.

    let msg;

    if (!clue.showing) { // If the clue is not showing.
        msg = clue.question; // Set the message as the question.
        clue.showing = "question"; // Update the showing status to "question".
    } else if (clue.showing === "question") { // If the clue is showing the question.
        msg = clue.answer; // Set the message as the answer.
        clue.showing = "answer"; // Update the showing status to "answer".
    } else {
        return; // If the clue is already showing the answer, return.
    }

    $(`#${catId}-${clueId}`).html(msg); // Update the cell with the corresponding message.
}

async function setupAndStart() {
    let catIds = await getCategoryIds(); // Get a list of category IDs.

    categories = []; // Reset the categories array.

    for (let catId of catIds) {
        categories.push(await getCategory(catId)); // Fetch and store category data for each ID.
    }

    fillTable(); // Fill the table with categories and clues.
}

$("#restart").on("click", setupAndStart); // Bind the setupAndStart function to the click event of the "restart" element.

$(async function () {
    setupAndStart(); // Call the setupAndStart function when the document is ready.
    $("#jeopardy").on("click", "td", handleClick); // Bind the handleClick function to the click event of table data cells within the "jeopardy" element.
});

