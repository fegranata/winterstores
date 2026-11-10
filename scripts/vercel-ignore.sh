#!/bin/bash
# Vercel "Ignored Build Step" (vercel.json → ignoreCommand).
# Exit 0 = skip the build, exit 1 = build.
#
# Lives in a file because vercel.json rejects an ignoreCommand longer than
# 256 characters — an over-long one fails the deployment outright, with no log.
#
# Skips only when nothing that affects the built site changed since the LAST
# DEPLOYED commit ($VERCEL_GIT_PREVIOUS_SHA). Comparing only HEAD^..HEAD would
# skip a code commit that is followed by a docs commit in the same push.
#
# Every doubtful case builds: no previous deployment, a previous SHA outside
# the shallow clone (git diff errors), or any git failure.

prev="$VERCEL_GIT_PREVIOUS_SHA"

if [ -z "$prev" ]; then
  echo "No previous deployment SHA: building."
  exit 1
fi

if ! git cat-file -e "$prev^{commit}" 2>/dev/null; then
  echo "Previous deployment $prev is not in this clone: building."
  exit 1
fi

# The monthly maintenance commit touches only this file, and that commit is
# what deploys newly discovered stores (/store/[slug] has dynamicParams =
# false). A change to it always builds.
if ! git diff --quiet "$prev" HEAD -- content/maintenance-log.md; then
  echo "content/maintenance-log.md changed: building."
  exit 1
fi

# Docs, notes, outreach files, SQL, workflows and Claude config never reach
# the built site.
if git diff --quiet "$prev" HEAD -- . \
  ':(exclude)*.md' ':(exclude)**/*.md' \
  ':(exclude)content/' ':(exclude)outreach/' ':(exclude)sql/' \
  ':(exclude).github/' ':(exclude).claude/'; then
  echo "Only docs changed since $prev: skipping the build."
  exit 0
fi

echo "Site files changed since $prev: building."
exit 1
