import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";

export default function SpeciesDetailsDialog({ species }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Learn more
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Species Details</DialogTitle>
          <DialogDescription>
            {species.image && (
              <div className="relative h-80 w-full">
                <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
              </div>
            )}
            <h3 className="mt-3 text-2xl font-semibold">{species.common_name}</h3>
            <h4 className="text-lg font-light italic">{species.scientific_name}</h4>
            <p>{species.description}</p>
            <h3 className="mt-3 text-2xl font-semibold">Facts</h3>
            <h3>Population: {species.total_population || "N/A"}</h3>
            <h3>Kingdom: {species.kingdom}</h3>
          </DialogDescription>
        </DialogHeader>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
