window.addEventListener("load", function() {
    const client = ZAFClient.init();// ZAF SDK (v2)
    client.invoke("resize", { width: "100%", height: "200px" }); // Resize the iframe

    // Function to check if requester is a client, to avoid processing agent tickets
    async function isClient() {
        const data = await client.get("ticket.requester");
        return data["ticket.requester"].role === "end-user";
    }
    // Function to check if ticket already has the tag "latest_order_retrieved"
    async function alreadyProcessed() {
        const data = await client.get("ticket.tags");
        const tags = data["ticket.tags"] || [];
        return tags.includes("latest_order_retrieved");
    }
    // Function to get requester email
    async function getEmail(){
        const data = await client.get("ticket.requester");
        return data["ticket.requester"].email;
    }
    // Function to get the App apiToken
    async function getApiToken(){
        const metadata = await client.metadata();
        return metadata.settings.apiToken;
    }
    // Function to update ticket with internal comment
    async function addInternalComment(id, comment){
        client.request({
            url: `/api/v2/tickets/${id}.json`,
            type: "PUT",
            data: {
                ticket: {
                    comment: {
                        body: comment,
                        public: false
                    }
                }
            }
        }).then(() => {
            console.log("Internal comment added to ticket.");
        }).catch(error => {
            console.error("Error adding internal comment:", error);
        });
    }
    // Function to update ticket tags to include "latest_order_retrieved", used to avoid duplicate processing
    async function updateTicketTags(id){
        client.request({
            url: `/api/v2/tickets/${id}/tags.json`,
            type: "PUT",
            data: {
                tags: ["latest_order_retrieved"]
            }
        }).then(() => {
            console.log("Ticket tags updated.");
        }).catch(error => {
            console.error("Error updating ticket tags:", error);
        });
    }
    // When the ticket is opened and app is loaded
    client.on("app.registered", async function(){
        const orderInfo = document.getElementById("order-info");// Element to display order info
        if(!await isClient()){// If requester is not a client, display message and do not proceed
            orderInfo.innerHTML = "Ticket requester is not a client. No order info available.";
            orderInfo.style.color = "red";
            return;
        }
        if(await alreadyProcessed()){// If ticket already processed, do not attempt to get order info again
            orderInfo.innerHTML = "Latest order info has already been retrieved for this ticket.";
            orderInfo.style.color = "orange";
            return;
        }
        // Get requester email
        const email = await getEmail();
        if(!email){// If no email found, display error
            orderInfo.innerHTML = "No email found for ticket requester.";
            orderInfo.style.color = "red";
            return;
        }

        // Calling the middleware to get latest order info based on requester email
        console.log("Fetching order info for email:", email);
        fetch(`http://localhost:3000/order?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-token": await getApiToken() // Pass the apiToken for request verification
            }
        })
            .then(response => response.json())
            .then(order => {
                if(order.error){
                    orderInfo.innerHTML = "Error retrieving order info.";
                    orderInfo.style.color = "red";
                    return;
                }
                if(!order.success){
                    orderInfo.innerHTML = order.message;
                    orderInfo.style.color = "red";
                    return;
                }
                // Display order info in iframe
                orderInfo.innerHTML = `<strong>Order ID:</strong> ${order.id}<br>
                                        <strong>Date:</strong> ${order.date}<br>
                                        <strong>Status:</strong> ${order.status}<br>`;

                // Display order info as internal comment in ticket
                const comment = `Latest Order Info:\n\nOrder ID: ${order.id}\nDate: ${order.date}\nStatus: ${order.status}`;
                client.get("ticket.id").then(function(data){
                    const id = data["ticket.id"];
                    // Add internal comment to ticket
                    addInternalComment(id, comment);
                    // Add tag to ticket to indicate order info has been retrieved for future reference
                    updateTicketTags(id);
                });
            })
            .catch(error => {
                orderInfo.innerHTML = "Error retrieving order info.";
                orderInfo.style.color = "red";
            });
    });
});