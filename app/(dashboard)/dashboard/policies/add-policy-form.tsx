"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Define policy types
const policyTypes = [
  "Motor",
  "Fire and Burglary",
  "Travel",
  "Performance Bond",
  "Marine",
  "Aviation",
  "Health",
  "Life",
  "Property",
  "Liability",
  "Other",
]

// Define the form schema with validation
const formSchema = z.object({
  policy_type: z.string({
    required_error: "Please select a policy type",
  }),
  client_id: z.string({
    required_error: "Please select a client",
  }),
  premium: z.coerce
    .number({
      required_error: "Premium is required",
      invalid_type_error: "Premium must be a number",
    })
    .positive("Premium must be a positive number"),
  commission_rate: z.coerce
    .number({
      required_error: "Commission rate is required",
      invalid_type_error: "Commission rate must be a number",
    })
    .min(0, "Commission rate cannot be negative")
    .max(100, "Commission rate cannot exceed 100%"),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z
    .date({
      required_error: "End date is required",
    })
    .refine((date) => date > new Date(), {
      message: "End date must be in the future",
    }),
  policy_number: z.string().optional(),
})

// Define the form input type based on the schema
type FormValues = z.infer<typeof formSchema>

// Define client type
interface Client {
  id: string
  name: string
  email: string
}

export default function AddPolicyForm() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [policyNumber, setPolicyNumber] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policy_type: "",
      client_id: "",
      premium: undefined,
      commission_rate: undefined,
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      policy_number: "",
    },
  })

  // Generate a policy number when the component mounts
  useEffect(() => {
    generatePolicyNumber()
  }, [])

  // Fetch clients when the component mounts
  useEffect(() => {
    fetchClients()
  }, [user])

  // Generate a unique policy number
  const generatePolicyNumber = () => {
    const prefix = "POL"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const newPolicyNumber = `${prefix}-${timestamp}-${random}`
    setPolicyNumber(newPolicyNumber)
    form.setValue("policy_number", newPolicyNumber)
  }

  // Fetch clients from Supabase
  const fetchClients = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email")
        .eq("created_by", user.id)
        .order("name", { ascending: true })

      if (error) throw error

      setClients(data || [])
    } catch (error: any) {
      console.error("Error fetching clients:", error.message)
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a policy.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate commission amount
      const commission_amount = (values.premium * values.commission_rate) / 100

      // Format dates for Supabase
      const formattedStartDate = format(values.start_date, "yyyy-MM-dd")
      const formattedEndDate = format(values.end_date, "yyyy-MM-dd")

      // Prepare policy data
      const policyData = {
        policy_type: values.policy_type,
        client_id: values.client_id,
        premium: values.premium,
        commission_rate: values.commission_rate,
        commission_amount,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        policy_number: values.policy_number || policyNumber,
        created_by: user.id,
      }

      // Insert policy into Supabase
      const { data, error } = await supabase.from("policies").insert([policyData]).select()

      if (error) throw error

      toast({
        title: "Success",
        description: `Policy ${policyNumber} has been added successfully.`,
      })

      // Reset form and generate new policy number
      form.reset()
      generatePolicyNumber()

      // Redirect to policies list
      router.push("/dashboard/policies")
    } catch (error: any) {
      console.error("Error adding policy:", error.message)
      toast({
        title: "Error",
        description: `Failed to add policy: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Policy</CardTitle>
        <CardDescription>Create a new insurance policy for a client</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Policy Type */}
              <FormField
                control={form.control}
                name="policy_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select policy type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Client Selection */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading clients...</span>
                          </div>
                        ) : clients.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No clients found. Please add a client first.
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Premium */}
              <FormField
                control={form.control}
                name="premium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premium (GHC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Enter the premium amount in GHC</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Commission Rate */}
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber)
                        }}
                      />
                    </FormControl>
                    <FormDescription>Enter the commission rate percentage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Policy Number (Auto-generated) */}
            <div className="border p-4 rounded-md bg-muted/50">
              <div className="font-medium mb-1">Policy Number</div>
              <div className="text-lg font-mono">{policyNumber}</div>
              <p className="text-sm text-muted-foreground mt-1">This policy number is automatically generated</p>
            </div>

            {/* Commission Amount Preview */}
            {form.watch("premium") && form.watch("commission_rate") && (
              <div className="border p-4 rounded-md bg-muted/50">
                <div className="font-medium mb-1">Commission Amount (Preview)</div>
                <div className="text-lg">
                  GHC {(((form.watch("premium") || 0) * (form.watch("commission_rate") || 0)) / 100).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Calculated as: Premium × Commission Rate ÷ 100</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/policies")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || clients.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Policy...
                  </>
                ) : (
                  "Add Policy"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
