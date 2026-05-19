import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/lib/api";

const baseTask: Task = {
  id: "1",
  title: "Buy groceries",
  description: "Milk, eggs, bread",
  status: "PENDING",
  dueDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
};

describe("TaskCard", () => {
  it("renders the task title", () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={vi.fn()} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders the task description", () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={vi.fn()} />);
    expect(screen.getByText("Milk, eggs, bread")).toBeInTheDocument();
  });

  it("shows Pending badge for PENDING tasks", () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={vi.fn()} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows Done badge for DONE tasks", () => {
    const doneTask = { ...baseTask, status: "DONE" as const };
    render(<TaskCard task={doneTask} onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={vi.fn()} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={onDelete} onToggleStatus={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Delete task"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={vi.fn()} onToggleStatus={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Edit task"));
    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });

  it("calls onToggleStatus when the status circle is clicked", () => {
    const onToggleStatus = vi.fn();
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={onToggleStatus} />);
    fireEvent.click(screen.getByLabelText("Mark as done"));
    expect(onToggleStatus).toHaveBeenCalledWith(baseTask);
  });

  it("shows overdue warning for past due dates on pending tasks", () => {
    const overdueTask = { ...baseTask, dueDate: "2020-01-01T00:00:00.000Z" };
    render(<TaskCard task={overdueTask} onEdit={vi.fn()} onDelete={vi.fn()} onToggleStatus={vi.fn()} />);
    expect(screen.getByText(/overdue|Due/i)).toBeInTheDocument();
  });
});
