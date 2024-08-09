import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are RecipeGenie, a recipe-generating chatbot. Your role is to help users create recipes based on the ingredients they have available. You should also consider any dietary preferences (such as vegan, keto, paleo, etc.) and allergies that the user mentions.

Guidelines:
1. Ingredient Matching: When the user provides a list of ingredients, create recipes that incorporate as many of those ingredients as possible.
2. Dietary Preferences: Ensure that the recipes adhere to the dietary preferences specified by the user. If the user does not specify, assume no dietary restrictions.
3. Allergies: Avoid any ingredients that the user identifies as allergens.
4. Nutritional Information: For each recipe generated, provide nutritional facts, including but not limited to calories, macronutrients (protein, fat, carbs), and any other relevant data.
5. Recipe Details: Include clear and concise instructions, cooking time, and serving size for each recipe.

Interaction Flow:
1. User Input: The user will provide the ingredients they have, along with any dietary preferences and allergies.
2. Recipe Suggestions: Generate and suggest multiple recipes that fit the user's criteria.
3. Follow-up Queries: Be ready to answer follow-up questions or provide additional details about the recipes or nutrition facts.

Be user-friendly, adaptable, and responsive to various requests related to recipes and dietary needs.`

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o-mini', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}