# patches

Applied automatically by `patch-package` on `npm install` (see the `postinstall` script).

## expo-modules-jsi+57.1.1.patch

**What it fixes:** local iOS builds (`npx expo run:ios`, Xcode) fail on
Xcode 26.2 / 26.3 (Swift 6.2.x) inside the `Build ExpoModulesJSI xcframework`
phase. Two separate compiler errors, both fixed by this patch:

1. `RuntimeScheduler.h`
   ```
   'RuntimeScheduler' cannot be annotated with either SWIFT_RETURNS_RETAINED or
   SWIFT_RETURNS_UNRETAINED because it is not returning a SWIFT_SHARED_REFERENCE type
   ```
   Upstream added `SWIFT_RETURNS_RETAINED` to the two constructors in
   expo-modules-jsi 57.0.5 (expo/expo#49120) to silence Xcode 27 warnings, but
   Swift 6.2 rejects it. The patch makes the annotation conditional on the Apple
   clang build number (`__apple_build_version__ >= 18000000`, i.e. Xcode 27+),
   so both toolchains compile.

2. `JavaScriptRuntime.swift`
   ```
   sending 'resultPtr' risks causing data races   (and thisPtr / argumentsPtr)
   ```
   expo-modules-jsi 57.1.0 moved the host-function result write inside the
   `@JavaScriptActor` closure and relies on `nonisolated(unsafe)` locals to
   satisfy strict concurrency. Swift 6.2.x does not honour that for these
   captures. The patch wraps the three call-scoped pointers in a small
   `@unchecked Sendable` box, which is exempt from region checking. No
   behaviour change: the pointers were already intended to be captured unsafely.

EAS cloud builds were never affected (they use a different Xcode).

**When to remove:** once expo-modules-jsi ships a release that compiles on stable
Xcode without these changes. Track https://github.com/expo/expo/issues/50067.
After `npx expo install --fix`, if `patch-package` reports the patch no longer
applies, check whether the two errors above still occur with a clean
`npx expo run:ios`. If they do not, delete this directory, remove the
`postinstall` script and the `patch-package` devDependency from package.json,
and run `npm install`.
