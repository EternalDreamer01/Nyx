#!/usr/bin/jq

def tag(s):
  reduce s as $x ({n:0, o:{}} ;
    .n += 1
    | .o += { (.n|tostring): $x})
  | .o;

{date: first(.. | objects | select(.tag == "time" and has("text")) | .text)} as $date
| tag(.. 
      | objects
      | select(has("title") and (has("children")|not) and .title == "Album Title")
      + $date )