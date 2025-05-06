"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createClient(formData?: FormData) {
  try {
    // Step 1: Get the current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const userId = userData.user.id

    // Step 2: Check if the user exists in the 'agents' table
    const { data: agent, error: agentError } = await supabase.from("agents").select("id").eq("id", userId).single()

    if (agentError) {
      // If the error is because no rows were returned, it means the agent doesn't exist
      if (agentError.code === "PGRST116") {
        // Try to add the user as an agent
        const agentResult = await addCurrentUserAsAgent()

        if (!agentResult.success) {
          throw new Error("You are not authorized to add clients. Please contact support.")
        }
      } else {
        throw new Error(`Agent verification error: ${agentError.message}`)
      }
    }

    // Step 3: If agent exists or was just created, proceed to insert client
    // Use form data if provided, otherwise use default values
    const clientData = {
      name: formData ? (formData.get("name") as string) : "John Doe",
      email: formData ? (formData.get("email") as string) : "john.doe@example.com",
      phone: formData ? (formData.get("phone") as string) : "+233244123456",
      phone_number: formData ? (formData.get("phone") as string) : "+233244123456",
      address: formData ? (formData.get("address") as string) : "Accra, Ghana",
      created_by: userId,
    }

    // Step 4: Insert the client
    const { data, error: insertError } = await supabase.from("clients").insert(clientData).select()

    if (insertError) {
      throw new Error(`Error adding client: ${insertError.message}`)
    }

    // Revalidate the clients page to show the new client
    revalidatePath("/dashboard/clients")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating client:", error)
    return { success: false, error: error.message }
  }
}

// Add a function to check if the agents table exists and create it if it doesn't
export async function ensureAgentsTable() {
  try {
    // Check if the agents table exists
    const { error: checkError } = await supabase.from("agents").select("id").limit(1)

    // If there's an error and it's because the table doesn't exist
    if (checkError && checkError.code === "42P01") {
      // PostgreSQL error code for undefined_table
      // Create the agents table
      const { error: createError } = await supabase.rpc("create_agents_table_if_not_exists")

      if (createError && !createError.message.includes("does not exist")) {
        throw createError
      }

      return { success: true, message: "Agents table created" }
    } else if (checkError) {
      throw checkError
    }

    return { success: true, message: "Agents table exists" }
  } catch (error: any) {
    console.error("Error ensuring agents table:", error)
    return { success: false, error: error.message }
  }
}

// Add a function to add the current user to the agents table
export async function addCurrentUserAsAgent() {
  try {
    // Get the current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`)
    }

    if (!userData.user) {
      throw new Error("User not authenticated")
    }

    const userId = userData.user.id

    // Check if the user already exists in the agents table
    const { data: existingAgent, error: checkError } = await supabase
      .from("agents")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(`Error checking agent: ${checkError.message}`)
    }

    // If the agent already exists, return success
    if (existingAgent) {
      return { success: true, message: "User is already an agent" }
    }

    // Add the user to the agents table with metadata
    const { error: insertError } = await supabase.from("agents").insert({
      id: userId,
      full_name: userData.user.user_metadata?.full_name || "Unnamed Agent",
      email: userData.user.email,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      throw new Error(`Error adding agent: ${insertError.message}`)
    }

    return { success: true, message: "User added as agent" }
  } catch (error: any) {
    console.error("Error adding user as agent:", error)
    return { success: false, error: error.message }
  }
}
