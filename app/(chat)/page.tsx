"use client"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Calendar, Clock, FileText, CheckCircle, Brain, BookOpen, FileUp, ChevronRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-20 md:py-28 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Study Smarter, Not Harder with <span className="text-primary">MyCally</span>
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Your AI-powered productivity suite that intelligently organizes tasks, generates quizzes, and creates
                  study materials from your notes.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/login">Start Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">
                    How it Works
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-background shadow-xl">
                <Image
                  src="/images/landing.png"
                  width={600}
                  height={400}
                  alt="MyCally Dashboard Preview"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Everything You Need to Excel</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                MyCally streamlines your academic journey with powerful AI-enhanced tools designed to help you stay
                organized and learn effectively.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <motion.div
              className="grid gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">AI Calendar</h3>
              <p className="text-muted-foreground">
                Smart scheduling with AI-powered task prioritization to maximize your productivity.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Quiz Generator</h3>
              <p className="text-muted-foreground">
                Create custom quizzes from your notes to test your knowledge and prepare for exams.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">PDF Generator</h3>
              <p className="text-muted-foreground">
                Transform your notes into well-structured study materials and comprehensive summaries.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Smart Insights</h3>
              <p className="text-muted-foreground">
                Receive personalized recommendations based on your study patterns and performance.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Note Upload</h3>
              <p className="text-muted-foreground">
                Easily upload and organize your notes for AI-powered analysis and transformation.
              </p>
            </motion.div>
            <motion.div
              className="grid gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Time Management</h3>
              <p className="text-muted-foreground">
                Optimize your study sessions with data-driven insights on your most productive hours.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted py-20 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Discover MyCally's Core Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                See how our powerful tools can transform your productivity and learning experience.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-4xl py-12">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar">AI Calendar</TabsTrigger>
                <TabsTrigger value="quiz">Quiz Generator</TabsTrigger>
                <TabsTrigger value="pdf">PDF Creator</TabsTrigger>
              </TabsList>
              <TabsContent value="calendar" className="pt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col justify-center gap-4">
                    <h3 className="text-2xl font-bold">Smart Task Prioritization</h3>
                    <p className="text-muted-foreground">
                      MyCally's AI analyzes your deadlines, difficulty levels, and personal preferences to create an
                      optimized schedule that maximizes your efficiency.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Automatic task prioritization based on deadlines and importance</span>
                      </li>
                      {/* <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Intelligent time blocking for deep focus sessions</span>
                      </li> */}
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Real-time adjustments based on your progress and feedback</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border bg-background p-2 shadow-lg">
                    <Image
                      src="/images/landing.png"
                      width={600}
                      height={400}
                      alt="AI Calendar Feature"
                      className="rounded-lg object-cover w-full h-auto aspect-video"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="quiz" className="pt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col justify-center gap-4">
                    <h3 className="text-2xl font-bold">Custom Knowledge Assessment</h3>
                    <p className="text-muted-foreground">
                      Our quiz generator analyzes your notes to create personalized questions that test your
                      understanding and help reinforce key concepts.
                    </p>
                    <ul className="space-y-2">
                      {/* <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Multiple quiz formats including multiple choice, short answer, and matching</span>
                      </li> */}
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Adaptive difficulty based on your performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Detailed explanations for correct answers to aid learning</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border bg-background p-2 shadow-lg">
                    <Image
                      src="/images/landing.png"
                      width={600}
                      height={400}
                      alt="Quiz Generator Feature"
                      className="rounded-lg object-cover w-full h-auto aspect-video"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="pdf" className="pt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex flex-col justify-center gap-4">
                    <h3 className="text-2xl font-bold">Structured Study Materials</h3>
                    <p className="text-muted-foreground">
                      Transform your notes into well-organized, comprehensive study guides that highlight key concepts
                      and make complex information easier to digest.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Automatic organization of information into logical sections</span>
                      </li>
                      {/* <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Visual elements like charts and diagrams to enhance understanding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>Customizable templates for different types of study materials</span>
                      </li> */}
                    </ul>
                  </div>
                  <div className="rounded-xl border bg-background p-2 shadow-lg">
                    <Image
                      src="/images/landing.png"
                      width={600}
                      height={400}
                      alt="PDF Generator Feature"
                      className="rounded-lg object-cover w-full h-auto aspect-video"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Testimonials</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Loved by Students and Educators</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover how MyCally is helping users achieve their academic goals more efficiently.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              className="rounded-xl border bg-background p-6 shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Image
                      src="/images/ryan.jpeg"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Ryan Nguyen</h4>
                    <p className="text-sm text-muted-foreground">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "MyCally revolutionized how I study. The AI calendar helped me prioritize effectively, and the quiz
                  generator made exam prep so much easier."
                </p>
              </div>
            </motion.div>
            <motion.div
              className="rounded-xl border bg-background p-6 shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Image
                      src="/images/roy.jpeg"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Roy Alcala</h4>
                    <p className="text-sm text-muted-foreground">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "I recommend MyCally to everyone. The PDF generator creates excellent study materials from
                  lecture notes, saving me time in creating resources."
                </p>
              </div>
            </motion.div>
            <motion.div
              className="rounded-xl border bg-background p-6 shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Image
                      src="/images/manny.png"
                      width={40}
                      height={40}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Manny Lopez</h4>
                    <p className="text-sm text-muted-foreground">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Balancing work and studies was impossible until I found MyCally. The smart calendar integrates
                  perfectly with my busy schedule, and I love the quiz feature."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted py-20 w-full blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Pricing</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Choose the plan that fits your needs. All plans include access to our core features.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
            <Card className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="text-muted-foreground">Perfect for getting started</p>
                </div>
                <div className="my-6">
                  <div className="text-4xl font-bold">$0</div>
                  <div className="text-muted-foreground">Forever free</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>AI Calendar (Basic)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Quiz Generator (5 per month)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>PDF Creator (3 per month)</span>
                  </li>
                </ul>
                <Button variant="outline" disabled className="w-full mt-auto" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col relative border-primary">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </div>
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Student</h3>
                  <p className="text-muted-foreground">Ideal for active students</p>
                </div>
                <div className="my-6">
                  <div className="text-4xl font-bold">$9.99</div>
                  <div className="text-muted-foreground">per month</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>AI Calendar (Advanced)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Unlimited Quizzes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Unlimited PDFs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Smart Insights</span>
                  </li>
                </ul>
                <Button className="w-full mt-auto" disabled asChild>
                  <Link href="/login">Start 7-Day Trial</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="text-muted-foreground">For advanced users</p>
                </div>
                <div className="my-6">
                  <div className="text-4xl font-bold">$19.99</div>
                  <div className="text-muted-foreground">per month</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>All Student features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Custom Templates</span>
                  </li>
                </ul>
                <Button variant="outline" disabled className="w-full mt-auto" asChild>
                  <Link href="/login">Start 7-Day Trial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="mx-auto text-muted-foreground md:text-xl">
                Join thousands of students who are already using MyCally to optimize their learning and achieve better
                results.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/login">Start Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted w-full">
        <div className="container mx-auto flex flex-col gap-6 py-8 md:py-12 px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">MyCally</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI-powered productivity suite for students and academics.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MyCally. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}