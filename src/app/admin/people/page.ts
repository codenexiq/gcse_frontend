import { redirect } from "next/navigation";

export default function PeopleIndex() {
  redirect("/admin/people/students");
}
