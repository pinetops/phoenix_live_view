# `:loading` Attribute Examples

## Overview

The `:loading` attribute works with `:if` to show alternative content when a condition is false. The loading content is rendered inside an HTML `<template>` tag.

## Basic Examples

### Example 1: Simple HTML in loading template

```elixir
def user_profile(assigns) do
  ~H"""
  <div :if={@user_loaded} :loading={~H"<p>Loading user...</p>"} class="profile">
    <h1>{@user.name}</h1>
    <p>{@user.bio}</p>
  </div>
  """
end
```

**When `@user_loaded = false`:**
```html
<template><p>Loading user...</p></template>
```

**When `@user_loaded = true`:**
```html
<div class="profile">
  <h1>John Doe</h1>
  <p>Software developer</p>
</div>
```

### Example 2: With a spinner component

```elixir
def spinner(assigns) do
  ~H"""
  <div class="spinner" role="status">
    <span class="sr-only">Loading...</span>
  </div>
  """
end

def data_table(assigns) do
  ~H"""
  <table :if={@data_loaded} :loading={~H"<.spinner />"}>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      <tr :for={user <- @users}>
        <td>{user.name}</td>
        <td>{user.email}</td>
      </tr>
    </tbody>
  </table>
  """
end
```

**When `@data_loaded = false`:**
```html
<template><div class="spinner" role="status">
  <span class="sr-only">Loading...</span>
</div></template>
```

**When `@data_loaded = true`:**
```html
<table>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

### Example 3: Complex loading template with multiple elements

```elixir
def content_section(assigns) do
  ~H"""
  <section
    :if={@content_ready}
    :loading={~H"""
    <div class="skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-body"></div>
      <div class="skeleton-footer"></div>
    </div>
    """}>
    <h2>{@title}</h2>
    <p>{@content}</p>
    <button>Read more</button>
  </section>
  """
end
```

### Example 4: Loading template as a separate component

```elixir
def loading_skeleton(assigns) do
  ~H"""
  <div class="animate-pulse">
    <div class="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div class="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
  """
end

def article(assigns) do
  ~H"""
  <article :if={@loaded} :loading={loading_skeleton(%{})} class="article">
    <h1>{@article.title}</h1>
    <p>{@article.body}</p>
  </article>
  """
end
```

### Example 5: In a LiveView with dynamic loading

```elixir
defmodule MyAppWeb.UserLive do
  use MyAppWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, assign(socket, user_loaded: false, user: nil)}
  end

  def handle_event("load_user", %{"id" => id}, socket) do
    # Simulate async loading
    send(self(), {:load_user, id})
    {:noreply, socket}
  end

  def handle_info({:load_user, id}, socket) do
    user = fetch_user(id)
    {:noreply, assign(socket, user_loaded: true, user: user)}
  end

  def render(assigns) do
    ~H"""
    <div>
      <button phx-click="load_user" phx-value-id="123">Load User</button>

      <div
        :if={@user_loaded}
        :loading={~H"""
        <div class="flex items-center gap-2">
          <.spinner />
          <span>Loading user data...</span>
        </div>
        """}
        class="user-card">
        <h2>{@user.name}</h2>
        <p>{@user.email}</p>
      </div>
    </div>
    """
  end

  defp spinner(assigns) do
    ~H"""
    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    """
  end
end
```

### Example 6: With component that receives attributes

```elixir
def loading_card(assigns) do
  ~H"""
  <div class="card loading">
    <div class="shimmer">
      <.icon name={@icon} />
      <span>{@message}</span>
    </div>
  </div>
  """
end

def dashboard_widget(assigns) do
  ~H"""
  <div
    :if={@data_loaded}
    :loading={loading_card(%{icon: "hero-clock", message: "Loading dashboard..."})}
    class="widget">
    <h3>{@widget_title}</h3>
    <div class="widget-content">{@widget_data}</div>
  </div>
  """
end
```

### Example 7: Multiple loading states

```elixir
def page(assigns) do
  ~H"""
  <div class="page">
    <header :if={@header_loaded} :loading={~H"<.skeleton type="header" />"}>
      <h1>{@title}</h1>
    </header>

    <main :if={@content_loaded} :loading={~H"<.skeleton type="content" />"}>
      <p>{@content}</p>
    </main>

    <aside :if={@sidebar_loaded} :loading={~H"<.skeleton type="sidebar" />"}>
      <ul>
        <li :for={item <- @sidebar_items}>{item}</li>
      </ul>
    </aside>
  </div>
  """
end

def skeleton(assigns) do
  ~H"""
  <div class={"skeleton skeleton-#{@type}"}>
    Loading...
  </div>
  """
end
```

## Key Points

1. **`:loading` requires `:if`** - Using `:loading` without `:if` will raise a compilation error
2. **Template content** - The value can be any HEEx template: `~H"..."` or `~H"""..."""`
3. **Components work** - You can call components with `<.component_name />` or function calls
4. **Rendered in `<template>` tag** - The loading content is always wrapped in an HTML `<template>` element when `:if` is false
5. **Assigns** - Loading component functions can receive assigns like any other component

## Pattern Matching

The implementation handles both `{:safe, iodata}` tuples and `Phoenix.LiveView.Rendered` structs, so you can pass:
- Direct HTML: `~H"<div>Loading...</div>"`
- Component calls: `~H"<.spinner />"`
- Function calls: `loading_template(%{})`
- Any combination of the above
