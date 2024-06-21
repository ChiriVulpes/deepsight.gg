import DeepsightGG from "DeepsightGG";
import applyDOMRectPrototypes from "utility/DOMRect";
import ArrayPrototypes from "utility/prototype/ArrayPrototypes";
import IterableIteratorPrototypes from "utility/prototype/IterableIteratorPrototypes";
import StringPrototypes from "utility/prototype/StringPrototypes";
import WeakMapPrototypes from "utility/prototype/WeakMapPrototypes";

applyDOMRectPrototypes();
StringPrototypes();
ArrayPrototypes();
WeakMapPrototypes();
IterableIteratorPrototypes();
new DeepsightGG();
