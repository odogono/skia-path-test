# Notes

https://gist.github.com/mbostock/1705868

https://github.com/herrstrietzel/svg-getpointatlength

https://www.youtube.com/watch?v=7SCzL-XnfUU

https://github.com/wcandillon/can-it-be-done-in-react-native/blob/master/bonuses/skia-examples/src/PathGradient/PathAlongGradient.tsx

https://stackoverflow.com/questions/78564255/how-to-use-react-native-reanimated-or-react-native-skia-to-make-a-shape-move-alo



First is to get the circle to follow the svg path.

Simple enough with the use of Skia.ContourMeasureIter, which gives us a position based on a t value (0-1).

Next is to get a trail following the path.

Skia Paths take a start and an end t value, which also go from 0-1.

So what we can do is render another Path element, but control the start and the end values.

However, paths typically have a start and an end, at which point they go from t=1 to t=0.

When this happens, our trail path loses it length.

This can be fixed by rendering two Path elements. The first is for when the start of the trail is 0 - trailLength, and then second is for everything past 0 to 1.

Setting a strokeCap and a strokeJoin makes the trail look better, and also avoids a nasty crease when the path starts and ends.


## Reactive Trail

This is all well and good for a continuous moving trail, but it would be nice to have a trail which fades over time, so that when it stops, it gradually receeds to a 0 length.

The idea with this is that the trail end is now untied from the main t value, and catches up with it over time.

<insert description of how to do this>



Up to now the trail has been moving continuously in one direction. So what happens if we hook it up to a slider which controls the position on the path.



The trail is a single colour, what would it take to have a sort of gradient with an alpha that increases over time.



[Skia - How to paint gradient color following a stroke path](https://groups.google.com/g/skia-discuss/c/gQvvYusrqTY)




### Protip

It is useful sometimes to be able to display a shared value on the UI.

The problem of course is that you can't just set a Text component, because it will not re-render when the shared value changes.

The solution is to use something like the [Retext](https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx) component.
What it does is to create an Animated version of a TextInput, and then you can pass in a shared value to it.