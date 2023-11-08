"use client";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {inscribeNFT} from "@/lib/sCrypt";

export default function MintForm() {
  const formSchema = z.object({
    inscibedText: z.string().min(2, {
      message: "Text message must be at least 2 characters.",
    }),
    secretMessage: z.string().min(2, {
      message: "secret message must be at least 2 characters.",
    }),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inscibedText: "",
      secretMessage: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    console.log(values);
    inscribeNFT(values.secretMessage, values.inscibedText);
  }

  return (
    <section className="flex w-full flex-col justify-center bg-slate-600 items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="inscibedText"
            render={({field}) => (
              <FormItem>
                <FormLabel>Text to Inscibe</FormLabel>
                <FormControl>
                  <Input placeholder="My NFT discription" {...field} />
                </FormControl>
                <FormDescription>This is the nft description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secretMessage"
            render={({field}) => (
              <FormItem>
                <FormLabel>Secret message</FormLabel>
                <FormControl>
                  <Input placeholder="secret string" {...field} />
                </FormControl>
                <FormDescription>
                  This is the nft's unlocking message
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </section>
  );
}
