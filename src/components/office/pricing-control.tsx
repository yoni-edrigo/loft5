import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function PricingControl() {
  const pricingData = useQuery(api.get_functions.getPricing);
  const updatePricing = useMutation(api.set_functions.updatePricing);
  const [pricing, setPricing] = useState({
    minimumPrice: 0,
    loftPerPerson: 0,
    foodPerPerson: 0,
    drinksPerPerson: 0,
    snacksPerPerson: 0,
    extraHourPerPerson: 0,
    afternoonWithoutKaraoke: 0,
    afternoonWithKaraoke: 0,
    photographerPrice: 0,
  });

  useEffect(() => {
    if (pricingData) {
      setPricing({
        minimumPrice: pricingData.minimumPrice,
        loftPerPerson: pricingData.loftPerPerson,
        foodPerPerson: pricingData.foodPerPerson,
        drinksPerPerson: pricingData.drinksPerPerson,
        snacksPerPerson: pricingData.snacksPerPerson,
        extraHourPerPerson: pricingData.extraHourPerPerson,
        afternoonWithoutKaraoke: pricingData.afternoonWithoutKaraoke,
        afternoonWithKaraoke: pricingData.afternoonWithKaraoke,
        photographerPrice: pricingData.photographerPrice,
      });
    }
  }, [pricingData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPricing((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePricing(pricing);
  };

  const pricingFields = [
    { name: "minimumPrice", label: "מחיר מינימום" },
    { name: "loftPerPerson", label: "מחיר לופט לאדם" },
    { name: "foodPerPerson", label: "מחיר אוכל לאדם" },
    { name: "drinksPerPerson", label: "מחיר שתייה לאדם" },
    { name: "snacksPerPerson", label: "מחיר נשנושים לאדם" },
    { name: "extraHourPerPerson", label: "מחיר שעה נוספת לאדם" },
    { name: "afternoonWithoutKaraoke", label: "מחיר אחה״צ ללא קריוקי" },
    { name: "afternoonWithKaraoke", label: "מחיר אחה״צ עם קריוקי" },
    { name: "photographerPrice", label: "מחיר צלם" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול מחירים</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={() => void handleSubmit}>
          <div className="mx-auto max-w-lg">
            <div className="bg-background overflow-hidden rounded-md border">
              <Table>
                <TableBody>
                  {pricingFields.map((field) => (
                    <TableRow
                      key={field.name}
                      className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                    >
                      <TableCell className="bg-muted/50 py-2 font-medium">
                        {field.label}
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          name={field.name}
                          value={pricing[field.name as keyof typeof pricing]}
                          onChange={handleInputChange}
                          type="number"
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-center">
              <Button type="submit">עדכן מחירים</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
