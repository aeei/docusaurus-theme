import React, { useEffect } from "react";
import { CircleCheck, Frame, LoaderCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@theme/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theme/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@theme/components/ui/breadcrumb";
import { Button } from "@theme/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@theme/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@theme/components/ui/dropdown-menu";
import { Input } from "@theme/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@theme/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@theme/components/ui/sheet";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@theme/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@theme/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@theme/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@theme/components/ui/tooltip";

const invoices = [
  ["INV001", "Paid", "Credit Card", "$250.00"],
  ["INV002", "Pending", "PayPal", "$150.00"],
  ["INV003", "Unpaid", "Bank Transfer", "$350.00"],
  ["INV004", "Paid", "Credit Card", "$450.00"],
  ["INV005", "Paid", "PayPal", "$550.00"],
  ["INV006", "Pending", "Bank Transfer", "$200.00"],
  ["INV007", "Unpaid", "Credit Card", "$300.00"],
];

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 32,
  padding: 32,
};

export default function BaseNovaParityFixtures(): React.ReactNode {
  useEffect(() => {
    const previousFontSize = document.body.style.fontSize;
    const previousLineHeight = document.body.style.lineHeight;
    document.body.style.fontSize = "16px";
    document.body.style.lineHeight = "24px";
    return () => {
      document.body.style.fontSize = previousFontSize;
      document.body.style.lineHeight = previousLineHeight;
    };
  }, []);

  return (
    <div data-parity-fixtures style={sectionStyle}>
      <section data-parity="button" style={{ display: "flex", gap: 8 }}>
        <Button variant="outline">Button</Button>
        <Button variant="outline" disabled>
          <LoaderCircle
            data-slot="spinner"
            data-icon="inline-start"
            aria-hidden="true"
            style={{ animation: "spin 1s linear infinite" }}
          />
          Generating
        </Button>
      </section>

      <section data-parity="accordion" style={{ width: 384 }}>
        <Accordion>
          <AccordionItem value="item-1">
            <AccordionTrigger>What are your shipping options?</AccordionTrigger>
            <AccordionContent>
              We offer standard (5-7 days), express (2-3 days), and overnight
              shipping. Free shipping on international orders.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section data-parity="tabs">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                  View your key metrics and recent project activity. Track
                  progress across all your active projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                You have 12 active projects and 3 pending tasks.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <section data-parity="card" style={{ display: "flex", width: 384 }}>
        <Card size="default" style={{ width: "100%", maxWidth: 384 }}>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link">Sign Up</Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 14,
                      lineHeight: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Email
                  </label>
                  <Input type="email" placeholder="m@example.com" />
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 14,
                      lineHeight: "20px",
                    }}
                  >
                    <label style={{ fontWeight: 500 }}>Password</label>
                    <a
                      href="#"
                      style={{
                        marginLeft: "auto",
                        color: "inherit",
                        fontWeight: 400,
                      }}
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input type="password" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter style={{ flexDirection: "column", gap: 8 }}>
            <Button style={{ width: "100%" }}>Login</Button>
            <Button variant="outline" style={{ width: "100%" }}>
              Login with Google
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section
        data-parity="alert"
        style={{ display: "grid", gap: 16, width: 448 }}
      >
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Payment successful</AlertTitle>
          <AlertDescription>
            Your payment of $29.99 has been processed. A receipt has been sent
            to your email address.
          </AlertDescription>
        </Alert>
      </section>

      <section data-parity="table" style={{ width: 558 }}>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 100 }}>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead style={{ textAlign: "right" }}>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(([invoice, status, method, amount]) => (
              <TableRow key={invoice}>
                <TableCell style={{ fontWeight: 500 }}>{invoice}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>{method}</TableCell>
                <TableCell style={{ textAlign: "right" }}>{amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell style={{ textAlign: "right" }}>$2,500.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      <section data-parity="breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="icon-sm" variant="ghost" />}
                >
                  <BreadcrumbEllipsis />
                  <span
                    style={{
                      position: "absolute",
                      width: 1,
                      height: 1,
                      overflow: "hidden",
                    }}
                  >
                    Toggle menu
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Documentation</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <section
        data-parity="sidebar"
        style={{ boxSizing: "border-box", width: 255, padding: 8 }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="#" />}>
              <Frame aria-hidden="true" />
              <span>Design Engineering</span>
            </SidebarMenuButton>
            <SidebarMenuAction aria-label="More actions">•••</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </section>

      <section data-parity="navigation-menu">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul style={{ width: 384 }}>
                  {[
                    [
                      "Introduction",
                      "Re-usable components built with Tailwind CSS.",
                    ],
                    [
                      "Installation",
                      "How to install dependencies and structure your app.",
                    ],
                    [
                      "Typography",
                      "Styles for headings, paragraphs, lists...etc",
                    ],
                  ].map(([title, description]) => (
                    <li key={title}>
                      <NavigationMenuLink href="#">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            fontSize: 14,
                            lineHeight: "20px",
                          }}
                        >
                          <div style={{ lineHeight: 1, fontWeight: 500 }}>
                            {title}
                          </div>
                          <div style={{ color: "var(--muted-foreground)" }}>
                            {description}
                          </div>
                        </div>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </section>

      <section data-parity="sheet" style={{ display: "flex" }}>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            Left
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </section>

      <section data-parity="dropdown" style={{ display: "flex" }}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Open
          </DropdownMenuTrigger>
          <DropdownMenuContent style={{ width: 160, height: 339 }}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>
                New Team<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>GitHub</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem disabled>API</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Log out<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <TooltipProvider>
        <section data-parity="tooltip" style={{ display: "flex" }}>
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This feature is currently unavailable</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>
              يسار
            </TooltipTrigger>
            <TooltipContent side="left">Add to library</TooltipContent>
          </Tooltip>
        </section>
      </TooltipProvider>
    </div>
  );
}
