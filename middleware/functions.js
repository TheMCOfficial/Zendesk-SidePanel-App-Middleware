import validator from 'email-validator';
// Functions used in the middleware, seperated from main flow for better organization
const orders = {
    // Function used to get the latest order of a client based on email
    // clientEmail would normally be used to filter orders from a real API
    lastOrder: async (clientEmail) => {
        if(!validator.validate(clientEmail)){// Validate email format, if invalid return error
            return {
                success: false,
                message: "Invalid email."
            };
        }
        // API call to a mock service (jsonplaceholder in this case) to get latest order
        try{
            const response = await fetch("https://jsonplaceholder.typicode.com/todos",{// Normally client email would be used to filter orders, for demo we fetch all
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            // If response not ok, throw error
            if(!response.ok){
                const error = await response.text();
                throw new Error(`Error fetching orders: Status ${response.status} - ${error}`);
            }
            // Randomize data array order to simulate different latest orders (since jsonplaceholder returns static data)
            const data = await response.json();
            const shuffledData = data.sort(() => 0.5 - Math.random());
            const latestOrder = shuffledData[shuffledData.length - 1]; // Pick the last order
            return {
                success: true,
                id: latestOrder.id,
                date: new Date().toISOString(), // Mock current date as order date
                status: latestOrder.completed ? "Completed" : "Pending"
            }

        }catch(error){
            console.error("Error in lastOrder():", error);
            return {// Return error response in case of failure
                success: false,
                message: "An error occurred while fetching the latest order."
            }
        }
    },
    // Function to verify zendesk signature from incoming requests
    verifyRequest: (req) => {
        const signature = req.headers["x-api-token"]; // Get signature from request headers
        return signature === process.env.ZENDESK_SECRET; // Compare and return verification result
    }
};
export default orders;