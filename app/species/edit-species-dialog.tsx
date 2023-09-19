"use client";
{
  /* <aside>
📝 **Add the functionality for users to edit a species’ information.**

Right now, there is no functionality for users to edit an existing species’ information. Implement functionality that allows users to edit information of **species that they have created**. (In other words, this editing functionality should only be available for species created by the user. You should **test this** with multiple user accounts!)

</aside>

<aside>
🌟 **Hints:
-** You’ll probably need to add new UI elements (e.g. a button) at some point. You can reference the [shadcn/ui documentation](https://ui.shadcn.com/docs) or search for “shadcn [component]” on Google to look for UI components you use.
- You should consult the [Supabase documentation](https://supabase.com/docs/reference/javascript/introduction) for guidance on editing existing entries in the database.
- `AddSpeciesDialog()` contains an `onSubmit` function that adds the new species to the database when the “Add Species” button is clicked. This should be a helpful reference for you to adapt to your implementation of editing.
- If needed, you can consult the documentation for [React Hook Form](https://react-hook-form.com/get-started) and [Zod](https://zod.dev/?id=introduction) to understand how form schema validation has been implemented.
- Make sure that the editing functionality you implement would be clear and easy to operate for a regular user. For instance, a user should be able to easily distinguish when they are editing a species vs. just viewing its information.

</aside>*/
}
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { type Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// We use zod (z) to define a schema for the "Add species" form.
// zod handles validation of the input values with methods like .string(), .nullable(). It also processes the form inputs with .transform() before the inputs are sent to the database.

{
  /*
Goals:
- Drop down box to select species created by current user (use supabase to get list of species created by current user)
- User id will be passed in as a prop
- When user selects a species, the form will be populated with the species' information
- User can edit the information and submit the form
- Form will be validated with zod
- Form will be submitted to  supabase
- User will be notified of success or failure
*/
}
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

const speciesSchema = z.object({
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission
    .transform((val) => (val?.trim() === "" ? null : val?.trim())),
  description: z
    .string()
    .nullable()
    .transform((val) => (val?.trim() === "" ? null : val?.trim())),
  kingdom: z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]),
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  total_population: z.number().int().positive().min(1).optional(),
  image: z
    .string()
    .url()
    .nullable()
    .transform((val) => val?.trim()),
});

type FormData = z.infer<typeof speciesSchema>;

const defaultValues: Partial<FormData> = {
  kingdom: "Animalia",
};

export default function EditSpeciesDialog({ userId }: { userID: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (input: FormData) => {
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const supabase = createClientComponentClient<Database>();
    const { error } = await supabase.from("species").insert([
      {
        author: userId,
        common_name: input.common_name,
        description: input.description,
        kingdom: input.kingdom,
        scientific_name: input.scientific_name,
        total_population: input.total_population,
        image: input.image,
      },
    ]);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }
    // Reset form values to the data values that have been processed by zod.
    // This way the user sees any changes that have occurred during transformation
    form.reset(input);

    setOpen(false);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Edit Species
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
          <DialogDescription>Edit the information of a species that you have created.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="kingdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    {/* Using shadcn/ui form with enum: https://github.com/shadcn-ui/ui/issues/772 */}
                    <Select onValueChange={(value) => field.onChange(kingdoms.parse(value))} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom, index) => (
                            <SelectItem key={index} value={kingdom}>
                              {kingdom}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
