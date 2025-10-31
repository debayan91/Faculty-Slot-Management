import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <section className="container flex flex-col items-center justify-center text-center h-full gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-center gap-4">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          A Minimalist Starting Point for Your Next.js Application
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Welcome to React Start. A clean, modern, and fully-featured template
          designed to get you up and running with Next.js and ShadCN UI in no
          time.
        </p>
      </div>
      <div className="flex gap-4">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </section>
  );
}
