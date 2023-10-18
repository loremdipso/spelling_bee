
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/smelte/src/components/Icon/Icon.svelte generated by Svelte v3.59.2 */

    const file$a = "node_modules/smelte/src/components/Icon/Icon.svelte";

    function create_fragment$b(ctx) {
    	let i;
    	let i_class_value;
    	let i_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "material-icons icon text-xl select-none " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-ysz42y");
    			attr_dev(i, "style", i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : "");
    			toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			toggle_class(i, "tip", /*tip*/ ctx[3]);
    			toggle_class(i, "text-base", /*small*/ ctx[0]);
    			toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			add_location(i, file$a, 7, 0, 160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[8], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 32 && i_class_value !== (i_class_value = "material-icons icon text-xl select-none " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-ysz42y")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*color*/ 16 && i_style_value !== (i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : "")) {
    				attr_dev(i, "style", i_style_value);
    			}

    			if (!current || dirty & /*$$props, reverse*/ 36) {
    				toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			}

    			if (!current || dirty & /*$$props, tip*/ 40) {
    				toggle_class(i, "tip", /*tip*/ ctx[3]);
    			}

    			if (!current || dirty & /*$$props, small*/ 33) {
    				toggle_class(i, "text-base", /*small*/ ctx[0]);
    			}

    			if (!current || dirty & /*$$props, xs*/ 34) {
    				toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, ['default']);
    	let { small = false } = $$props;
    	let { xs = false } = $$props;
    	let { reverse = false } = $$props;
    	let { tip = false } = $$props;
    	let { color = "default" } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('small' in $$new_props) $$invalidate(0, small = $$new_props.small);
    		if ('xs' in $$new_props) $$invalidate(1, xs = $$new_props.xs);
    		if ('reverse' in $$new_props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ('tip' in $$new_props) $$invalidate(3, tip = $$new_props.tip);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ small, xs, reverse, tip, color });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('small' in $$props) $$invalidate(0, small = $$new_props.small);
    		if ('xs' in $$props) $$invalidate(1, xs = $$new_props.xs);
    		if ('reverse' in $$props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ('tip' in $$props) $$invalidate(3, tip = $$new_props.tip);
    		if ('color' in $$props) $$invalidate(4, color = $$new_props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [small, xs, reverse, tip, color, $$props, $$scope, slots, click_handler];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			small: 0,
    			xs: 1,
    			reverse: 2,
    			tip: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get small() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const noDepth = ["white", "black", "transparent"];

    function getClass(prop, color, depth, defaultDepth) {
      if (noDepth.includes(color)) {
        return `${prop}-${color}`;
      }
      return `${prop}-${color}-${depth || defaultDepth} `;
    }

    function utils(color, defaultDepth = 500) {
      return {
        bg: depth => getClass("bg", color, depth, defaultDepth),
        border: depth => getClass("border", color, depth, defaultDepth),
        txt: depth => getClass("text", color, depth, defaultDepth),
        caret: depth => getClass("caret", color, depth, defaultDepth)
      };
    }

    class ClassBuilder {
      constructor(classes, defaultClasses) {
        this.defaults =
          (typeof classes === "function" ? classes(defaultClasses) : classes) ||
          defaultClasses;

        this.classes = this.defaults;
      }

      flush() {
        this.classes = this.defaults;

        return this;
      }

      extend(...fns) {
        return this;
      }

      get() {
        return this.classes;
      }

      replace(classes, cond = true) {
        if (cond && classes) {
          this.classes = Object.keys(classes).reduce(
            (acc, from) => acc.replace(new RegExp(from, "g"), classes[from]),
            this.classes
          );
        }

        return this;
      }

      remove(classes, cond = true) {
        if (cond && classes) {
          this.classes = classes
            .split(" ")
            .reduce(
              (acc, cur) => acc.replace(new RegExp(cur, "g"), ""),
              this.classes
            );
        }

        return this;
      }

      add(className, cond = true, defaultValue) {
        if (!cond || !className) return this;

        switch (typeof className) {
          case "string":
          default:
            this.classes += ` ${className} `;
            return this;
          case "function":
            this.classes += ` ${className(defaultValue || this.classes)} `;
            return this;
        }
      }
    }

    // inspired by from smelte/classes.js
    // TODO(perf): is this performant?
    // export class ClassBuilder {
    // 	private defaultClasses: string[];
    // 	private classes: string[];

    // 	// TODO(feat): add dev detection of duplicate/conflicting styles
    // 	constructor(private defaults: string) {
    // 		this.classes = this.defaultClasses = defaults.split(" ");
    // 	}

    // 	reset() {
    // 		// TODO(perf): is this faster than splitting the string?
    // 		this.classes = [...this.defaultClasses];
    // 		return this;
    // 	}

    // 	add(classes: string) {
    // 		this.add_internal(classes);
    // 		return this;
    // 	}

    // 	addIf(cond: boolean, classes: string) {
    // 		if (cond) {
    // 			this.add_internal(classes);
    // 		}
    // 		return this;
    // 	}

    // 	addIfElse(cond: boolean, classes: string, otherClasses: string) {
    // 		if (cond) {
    // 			this.add_internal(classes);
    // 		} else {
    // 			this.add_internal(otherClasses);
    // 		}
    // 		return this;
    // 	}

    // 	get() {
    // 		return this.classes.join(" ");
    // 	}

    // 	private add_internal(classes: string) {
    // 		if (classes) {
    // 			this.classes.push(...classes.split(" "));
    // 		}
    // 	}
    // }

    const defaultReserved = ["class", "add", "remove", "replace", "value"];

    function filterProps(reserved, props) {
      const r = [...reserved, ...defaultReserved];

      return Object.keys(props).reduce(
        (acc, cur) =>
          cur.includes("$$") || cur.includes("Class") || r.includes(cur)
            ? acc
            : { ...acc, [cur]: props[cur] },
        {}
      );
    }

    // Thanks Lagden! https://svelte.dev/repl/61d9178d2b9944f2aa2bfe31612ab09f?version=3.6.7
    function ripple(color, centered) {
      return function(event) {
        const target = event.currentTarget;
        const circle = document.createElement("span");
        const d = Math.max(target.clientWidth, target.clientHeight);

        const removeCircle = () => {
          circle.remove();
          circle.removeEventListener("animationend", removeCircle);
        };

        circle.addEventListener("animationend", removeCircle);
        circle.style.width = circle.style.height = `${d}px`;
        const rect = target.getBoundingClientRect();

        if (centered) {
          circle.classList.add(
            "absolute",
            "top-0",
            "left-0",
            "ripple-centered",
            `bg-${color}-transDark`
          );
        } else {
          circle.style.left = `${event.clientX - rect.left - d / 2}px`;
          circle.style.top = `${event.clientY - rect.top - d / 2}px`;

          circle.classList.add("ripple-normal", `bg-${color}-trans`);
        }

        circle.classList.add("ripple");

        target.appendChild(circle);
      };
    }

    function r(color = "primary", centered = false) {
      return function(node) {
        const onMouseDown = ripple(color, centered);
        node.addEventListener("mousedown", onMouseDown);

        return {
          onDestroy: () => node.removeEventListener("mousedown", onMouseDown),
        };
      };
    }

    /* node_modules/smelte/src/components/Button/Button.svelte generated by Svelte v3.59.2 */
    const file$9 = "node_modules/smelte/src/components/Button/Button.svelte";

    // (128:0) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_2$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[9],
    		{ type: /*type*/ ctx[6] },
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$9, 128, 1, 3835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[8].call(null, button)),
    					listen_dev(button, "click", /*click_handler_3*/ ctx[42], false, false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[38], false, false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_1*/ ctx[39], false, false, false, false),
    					listen_dev(button, "focus", /*focus_handler_1*/ ctx[40], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[43], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[9],
    				(!current || dirty[0] & /*type*/ 64) && { type: /*type*/ ctx[6] },
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block.name,
    		type: "else",
    		source: "(128:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (109:0) {#if href}
    function create_if_block$1(ctx) {
    	let a;
    	let button;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_1$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[9],
    		{ type: /*type*/ ctx[6] },
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	let a_levels = [{ href: /*href*/ ctx[5] }, /*props*/ ctx[9]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$9, 110, 2, 3564);
    			set_attributes(a, a_data);
    			add_location(a, file$9, 109, 1, 3540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[8].call(null, button)),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[41], false, false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[35], false, false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler*/ ctx[36], false, false, false, false),
    					listen_dev(button, "focus", /*focus_handler*/ ctx[37], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[43], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[9],
    				(!current || dirty[0] & /*type*/ 64) && { type: /*type*/ ctx[6] },
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty[0] & /*href*/ 32) && { href: /*href*/ ctx[5] },
    				/*props*/ ctx[9]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(109:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (140:2) {#if icon}
    function create_if_block_2$1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[7],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 128) icon_1_changes.class = /*iClasses*/ ctx[7];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 4096) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(140:2) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (141:3) <Icon class={iClasses} {small}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(141:3) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    // (122:3) {#if icon}
    function create_if_block_1$1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[7],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 128) icon_1_changes.class = /*iClasses*/ ctx[7];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 4096) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(122:3) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (123:4) <Icon class={iClasses} {small}>
    function create_default_slot$4(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(123:4) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    const classesDefault$1 = "z-10 py-2 px-4 uppercase text-sm font-medium relative overflow-hidden";
    const basicDefault = "text-white duration-200 ease-in";
    const outlinedDefault = "bg-transparent border border-solid";
    const textDefault = "bg-transparent border-none px-4 hover:bg-transparent";
    const iconDefault = "p-4 flex items-center select-none";
    const fabDefault = "hover:bg-transparent";
    const smallDefault = "pt-1 pb-1 pl-2 pr-2 text-xs";
    const disabledDefault = "bg-gray-300 text-gray-500 dark:bg-dark-400 pointer-events-none hover:bg-gray-300 cursor-default";
    const elevationDefault = "hover:shadow shadow";

    function instance$a($$self, $$props, $$invalidate) {
    	let normal;
    	let lighter;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { value = false } = $$props;
    	let { outlined = false } = $$props;
    	let { text = false } = $$props;
    	let { block = false } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = null } = $$props;
    	let { small = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { flat = false } = $$props;
    	let { iconClass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { href = null } = $$props;
    	let { fab = false } = $$props;
    	let { type = "button" } = $$props;
    	let { remove = "" } = $$props;
    	let { add = "" } = $$props;
    	let { replace = {} } = $$props;
    	let { classes = classesDefault$1 } = $$props;
    	let { basicClasses = basicDefault } = $$props;
    	let { outlinedClasses = outlinedDefault } = $$props;
    	let { textClasses = textDefault } = $$props;
    	let { iconClasses = iconDefault } = $$props;
    	let { fabClasses = fabDefault } = $$props;
    	let { smallClasses = smallDefault } = $$props;
    	let { disabledClasses = disabledDefault } = $$props;
    	let { elevationClasses = elevationDefault } = $$props;
    	fab = fab || text && icon;
    	const basic = !outlined && !text && !fab;
    	const elevation = (basic || icon) && !disabled && !flat && !text;
    	let Classes = i => i;
    	let iClasses = i => i;
    	let shade = 0;
    	const { bg, border, txt } = utils(color);
    	const cb = new ClassBuilder(classes, classesDefault$1);
    	let iconCb;

    	if (icon) {
    		iconCb = new ClassBuilder(iconClass);
    	}

    	const ripple = r(text || fab || outlined ? color : "white");

    	const props = filterProps(
    		[
    			"outlined",
    			"text",
    			"color",
    			"block",
    			"disabled",
    			"icon",
    			"small",
    			"light",
    			"dark",
    			"flat",
    			"add",
    			"remove",
    			"replace"
    		],
    		$$props
    	);

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler_2 = () => $$invalidate(0, value = !value);
    	const click_handler_3 = () => $$invalidate(0, value = !value);

    	$$self.$$set = $$new_props => {
    		$$invalidate(51, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('outlined' in $$new_props) $$invalidate(11, outlined = $$new_props.outlined);
    		if ('text' in $$new_props) $$invalidate(12, text = $$new_props.text);
    		if ('block' in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ('disabled' in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('icon' in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ('small' in $$new_props) $$invalidate(4, small = $$new_props.small);
    		if ('light' in $$new_props) $$invalidate(14, light = $$new_props.light);
    		if ('dark' in $$new_props) $$invalidate(15, dark = $$new_props.dark);
    		if ('flat' in $$new_props) $$invalidate(16, flat = $$new_props.flat);
    		if ('iconClass' in $$new_props) $$invalidate(17, iconClass = $$new_props.iconClass);
    		if ('color' in $$new_props) $$invalidate(18, color = $$new_props.color);
    		if ('href' in $$new_props) $$invalidate(5, href = $$new_props.href);
    		if ('fab' in $$new_props) $$invalidate(10, fab = $$new_props.fab);
    		if ('type' in $$new_props) $$invalidate(6, type = $$new_props.type);
    		if ('remove' in $$new_props) $$invalidate(19, remove = $$new_props.remove);
    		if ('add' in $$new_props) $$invalidate(20, add = $$new_props.add);
    		if ('replace' in $$new_props) $$invalidate(21, replace = $$new_props.replace);
    		if ('classes' in $$new_props) $$invalidate(1, classes = $$new_props.classes);
    		if ('basicClasses' in $$new_props) $$invalidate(22, basicClasses = $$new_props.basicClasses);
    		if ('outlinedClasses' in $$new_props) $$invalidate(23, outlinedClasses = $$new_props.outlinedClasses);
    		if ('textClasses' in $$new_props) $$invalidate(24, textClasses = $$new_props.textClasses);
    		if ('iconClasses' in $$new_props) $$invalidate(25, iconClasses = $$new_props.iconClasses);
    		if ('fabClasses' in $$new_props) $$invalidate(26, fabClasses = $$new_props.fabClasses);
    		if ('smallClasses' in $$new_props) $$invalidate(27, smallClasses = $$new_props.smallClasses);
    		if ('disabledClasses' in $$new_props) $$invalidate(28, disabledClasses = $$new_props.disabledClasses);
    		if ('elevationClasses' in $$new_props) $$invalidate(29, elevationClasses = $$new_props.elevationClasses);
    		if ('$$scope' in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		utils,
    		ClassBuilder,
    		filterProps,
    		createRipple: r,
    		value,
    		outlined,
    		text,
    		block,
    		disabled,
    		icon,
    		small,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		href,
    		fab,
    		type,
    		remove,
    		add,
    		replace,
    		classesDefault: classesDefault$1,
    		basicDefault,
    		outlinedDefault,
    		textDefault,
    		iconDefault,
    		fabDefault,
    		smallDefault,
    		disabledDefault,
    		elevationDefault,
    		classes,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		basic,
    		elevation,
    		Classes,
    		iClasses,
    		shade,
    		bg,
    		border,
    		txt,
    		cb,
    		iconCb,
    		ripple,
    		props,
    		lighter,
    		normal
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(51, $$props = assign(assign({}, $$props), $$new_props));
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('outlined' in $$props) $$invalidate(11, outlined = $$new_props.outlined);
    		if ('text' in $$props) $$invalidate(12, text = $$new_props.text);
    		if ('block' in $$props) $$invalidate(13, block = $$new_props.block);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('icon' in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ('small' in $$props) $$invalidate(4, small = $$new_props.small);
    		if ('light' in $$props) $$invalidate(14, light = $$new_props.light);
    		if ('dark' in $$props) $$invalidate(15, dark = $$new_props.dark);
    		if ('flat' in $$props) $$invalidate(16, flat = $$new_props.flat);
    		if ('iconClass' in $$props) $$invalidate(17, iconClass = $$new_props.iconClass);
    		if ('color' in $$props) $$invalidate(18, color = $$new_props.color);
    		if ('href' in $$props) $$invalidate(5, href = $$new_props.href);
    		if ('fab' in $$props) $$invalidate(10, fab = $$new_props.fab);
    		if ('type' in $$props) $$invalidate(6, type = $$new_props.type);
    		if ('remove' in $$props) $$invalidate(19, remove = $$new_props.remove);
    		if ('add' in $$props) $$invalidate(20, add = $$new_props.add);
    		if ('replace' in $$props) $$invalidate(21, replace = $$new_props.replace);
    		if ('classes' in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ('basicClasses' in $$props) $$invalidate(22, basicClasses = $$new_props.basicClasses);
    		if ('outlinedClasses' in $$props) $$invalidate(23, outlinedClasses = $$new_props.outlinedClasses);
    		if ('textClasses' in $$props) $$invalidate(24, textClasses = $$new_props.textClasses);
    		if ('iconClasses' in $$props) $$invalidate(25, iconClasses = $$new_props.iconClasses);
    		if ('fabClasses' in $$props) $$invalidate(26, fabClasses = $$new_props.fabClasses);
    		if ('smallClasses' in $$props) $$invalidate(27, smallClasses = $$new_props.smallClasses);
    		if ('disabledClasses' in $$props) $$invalidate(28, disabledClasses = $$new_props.disabledClasses);
    		if ('elevationClasses' in $$props) $$invalidate(29, elevationClasses = $$new_props.elevationClasses);
    		if ('Classes' in $$props) Classes = $$new_props.Classes;
    		if ('iClasses' in $$props) $$invalidate(7, iClasses = $$new_props.iClasses);
    		if ('shade' in $$props) $$invalidate(30, shade = $$new_props.shade);
    		if ('iconCb' in $$props) $$invalidate(31, iconCb = $$new_props.iconCb);
    		if ('lighter' in $$props) $$invalidate(32, lighter = $$new_props.lighter);
    		if ('normal' in $$props) $$invalidate(33, normal = $$new_props.normal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*light, dark, shade*/ 1073790976) {
    			{
    				$$invalidate(30, shade = light ? 200 : 0);
    				$$invalidate(30, shade = dark ? -400 : shade);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*shade*/ 1073741824) {
    			$$invalidate(33, normal = 500 - shade);
    		}

    		if ($$self.$$.dirty[0] & /*shade*/ 1073741824) {
    			$$invalidate(32, lighter = 400 - shade);
    		}

    		$$invalidate(1, classes = cb.flush().add(basicClasses, basic, basicDefault).add(`${bg(normal)} hover:${bg(lighter)}`, basic).add(elevationClasses, elevation, elevationDefault).add(outlinedClasses, outlined, outlinedDefault).add(`${border(lighter)} ${txt(normal)} hover:${bg("trans")} dark-hover:${bg("transDark")}`, outlined).add(`${txt(lighter)}`, text).add(textClasses, text, textDefault).add(iconClasses, icon, iconDefault).remove("py-2", icon).remove(txt(lighter), fab).add(disabledClasses, disabled, disabledDefault).add(smallClasses, small, smallDefault).add("flex items-center justify-center h-8 w-8", small && icon).add("border-solid", outlined).add("rounded-full", icon).add("w-full", block).add("rounded", basic || outlined || text).add("button", !icon).add(fabClasses, fab, fabDefault).add(`hover:${bg("transLight")}`, fab).add($$props.class).remove(remove).replace(replace).add(add).get());

    		if ($$self.$$.dirty[0] & /*fab, iconClass*/ 132096 | $$self.$$.dirty[1] & /*iconCb*/ 1) {
    			if (iconCb) {
    				$$invalidate(7, iClasses = iconCb.flush().add(txt(), fab && !iconClass).get());
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		classes,
    		disabled,
    		icon,
    		small,
    		href,
    		type,
    		iClasses,
    		ripple,
    		props,
    		fab,
    		outlined,
    		text,
    		block,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		remove,
    		add,
    		replace,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		shade,
    		iconCb,
    		lighter,
    		normal,
    		slots,
    		click_handler,
    		mouseover_handler,
    		focus_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		focus_handler_1,
    		click_handler_2,
    		click_handler_3,
    		$$scope
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				value: 0,
    				outlined: 11,
    				text: 12,
    				block: 13,
    				disabled: 2,
    				icon: 3,
    				small: 4,
    				light: 14,
    				dark: 15,
    				flat: 16,
    				iconClass: 17,
    				color: 18,
    				href: 5,
    				fab: 10,
    				type: 6,
    				remove: 19,
    				add: 20,
    				replace: 21,
    				classes: 1,
    				basicClasses: 22,
    				outlinedClasses: 23,
    				textClasses: 24,
    				iconClasses: 25,
    				fabClasses: 26,
    				smallClasses: 27,
    				disabledClasses: 28,
    				elevationClasses: 29
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get basicClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basicClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlinedClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlinedClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fabClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fabClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get smallClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set smallClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elevationClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elevationClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/common/SmallButton.svelte generated by Svelte v3.59.2 */

    // (16:0) <Button  classes={finalClasses}  {disabled}  {color}  remove="p-4"  {icon}  {title}  on:click={() => dispatch("click")} >
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*title*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 8) set_data_dev(t, /*title*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(16:0) <Button  classes={finalClasses}  {disabled}  {color}  remove=\\\"p-4\\\"  {icon}  {title}  on:click={() => dispatch(\\\"click\\\")} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				classes: /*finalClasses*/ ctx[4],
    				disabled: /*disabled*/ ctx[0],
    				color: /*color*/ ctx[1],
    				remove: "p-4",
    				icon: /*icon*/ ctx[2],
    				title: /*title*/ ctx[3],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button_changes = {};
    			if (dirty & /*finalClasses*/ 16) button_changes.classes = /*finalClasses*/ ctx[4];
    			if (dirty & /*disabled*/ 1) button_changes.disabled = /*disabled*/ ctx[0];
    			if (dirty & /*color*/ 2) button_changes.color = /*color*/ ctx[1];
    			if (dirty & /*icon*/ 4) button_changes.icon = /*icon*/ ctx[2];
    			if (dirty & /*title*/ 8) button_changes.title = /*title*/ ctx[3];

    			if (dirty & /*$$scope, title*/ 1032) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let baseClasses;
    	let finalClasses;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SmallButton', slots, []);
    	let dispatch = createEventDispatcher();
    	let { disabled = false } = $$props;
    	let { reverse = false } = $$props;
    	let { classes = "" } = $$props;
    	let { color } = $$props;
    	let { icon } = $$props;
    	let { title } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<SmallButton> was created without expected prop 'color'");
    		}

    		if (icon === undefined && !('icon' in $$props || $$self.$$.bound[$$self.$$.props['icon']])) {
    			console.warn("<SmallButton> was created without expected prop 'icon'");
    		}

    		if (title === undefined && !('title' in $$props || $$self.$$.bound[$$self.$$.props['title']])) {
    			console.warn("<SmallButton> was created without expected prop 'title'");
    		}
    	});

    	const writable_props = ['disabled', 'reverse', 'classes', 'color', 'icon', 'title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SmallButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("click");

    	$$self.$$set = $$props => {
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('reverse' in $$props) $$invalidate(6, reverse = $$props.reverse);
    		if ('classes' in $$props) $$invalidate(7, classes = $$props.classes);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Button,
    		disabled,
    		reverse,
    		classes,
    		color,
    		icon,
    		title,
    		baseClasses,
    		finalClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ('dispatch' in $$props) $$invalidate(5, dispatch = $$props.dispatch);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('reverse' in $$props) $$invalidate(6, reverse = $$props.reverse);
    		if ('classes' in $$props) $$invalidate(7, classes = $$props.classes);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    		if ('icon' in $$props) $$invalidate(2, icon = $$props.icon);
    		if ('title' in $$props) $$invalidate(3, title = $$props.title);
    		if ('baseClasses' in $$props) $$invalidate(8, baseClasses = $$props.baseClasses);
    		if ('finalClasses' in $$props) $$invalidate(4, finalClasses = $$props.finalClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*classes*/ 128) {
    			$$invalidate(8, baseClasses = `m-1 px-3 py-2 small-button-vertical-padding ${classes}`);
    		}

    		if ($$self.$$.dirty & /*reverse, baseClasses*/ 320) {
    			$$invalidate(4, finalClasses = reverse
    			? `${baseClasses} flex flex-row-reverse`
    			: baseClasses);
    		}
    	};

    	return [
    		disabled,
    		color,
    		icon,
    		title,
    		finalClasses,
    		dispatch,
    		reverse,
    		classes,
    		baseClasses,
    		click_handler
    	];
    }

    class SmallButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			disabled: 0,
    			reverse: 6,
    			classes: 7,
    			color: 1,
    			icon: 2,
    			title: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SmallButton",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get disabled() {
    		throw new Error("<SmallButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SmallButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<SmallButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<SmallButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<SmallButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<SmallButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<SmallButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<SmallButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<SmallButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<SmallButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SmallButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SmallButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/Label.svelte generated by Svelte v3.59.2 */
    const file$8 = "node_modules/smelte/src/components/TextField/Label.svelte";

    function create_fragment$8(ctx) {
    	let label;
    	let label_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let label_levels = [
    		{
    			class: label_class_value = "" + (/*lClasses*/ ctx[0] + " " + /*$$props*/ ctx[2].class)
    		},
    		/*props*/ ctx[1]
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			toggle_class(label, "svelte-bsqfx8", true);
    			add_location(label, file$8, 45, 0, 1351);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(label, label_data = get_spread_update(label_levels, [
    				(!current || dirty & /*lClasses, $$props*/ 5 && label_class_value !== (label_class_value = "" + (/*lClasses*/ ctx[0] + " " + /*$$props*/ ctx[2].class))) && { class: label_class_value },
    				/*props*/ ctx[1]
    			]));

    			toggle_class(label, "svelte-bsqfx8", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Label', slots, ['default']);
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { outlined = false } = $$props;
    	let { labelOnTop = false } = $$props;
    	let { prepend = false } = $$props;
    	let { color = "primary" } = $$props;
    	let { bgColor = "white" } = $$props;
    	let { dense = false } = $$props;
    	let labelDefault = `pt-4 absolute top-0 label-transition block pb-2 px-4 pointer-events-none cursor-text`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { labelClasses = labelDefault } = $$props;
    	const { border, txt } = utils(color);
    	const l = new ClassBuilder(labelClasses, labelDefault);
    	let lClasses = i => i;
    	const props = filterProps(["focused", "error", "outlined", "labelOnTop", "prepend", "color", "dense"], $$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('focused' in $$new_props) $$invalidate(3, focused = $$new_props.focused);
    		if ('error' in $$new_props) $$invalidate(4, error = $$new_props.error);
    		if ('outlined' in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ('labelOnTop' in $$new_props) $$invalidate(6, labelOnTop = $$new_props.labelOnTop);
    		if ('prepend' in $$new_props) $$invalidate(7, prepend = $$new_props.prepend);
    		if ('color' in $$new_props) $$invalidate(8, color = $$new_props.color);
    		if ('bgColor' in $$new_props) $$invalidate(9, bgColor = $$new_props.bgColor);
    		if ('dense' in $$new_props) $$invalidate(10, dense = $$new_props.dense);
    		if ('add' in $$new_props) $$invalidate(11, add = $$new_props.add);
    		if ('remove' in $$new_props) $$invalidate(12, remove = $$new_props.remove);
    		if ('replace' in $$new_props) $$invalidate(13, replace = $$new_props.replace);
    		if ('labelClasses' in $$new_props) $$invalidate(14, labelClasses = $$new_props.labelClasses);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		focused,
    		error,
    		outlined,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		dense,
    		labelDefault,
    		add,
    		remove,
    		replace,
    		labelClasses,
    		border,
    		txt,
    		l,
    		lClasses,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ('focused' in $$props) $$invalidate(3, focused = $$new_props.focused);
    		if ('error' in $$props) $$invalidate(4, error = $$new_props.error);
    		if ('outlined' in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ('labelOnTop' in $$props) $$invalidate(6, labelOnTop = $$new_props.labelOnTop);
    		if ('prepend' in $$props) $$invalidate(7, prepend = $$new_props.prepend);
    		if ('color' in $$props) $$invalidate(8, color = $$new_props.color);
    		if ('bgColor' in $$props) $$invalidate(9, bgColor = $$new_props.bgColor);
    		if ('dense' in $$props) $$invalidate(10, dense = $$new_props.dense);
    		if ('labelDefault' in $$props) labelDefault = $$new_props.labelDefault;
    		if ('add' in $$props) $$invalidate(11, add = $$new_props.add);
    		if ('remove' in $$props) $$invalidate(12, remove = $$new_props.remove);
    		if ('replace' in $$props) $$invalidate(13, replace = $$new_props.replace);
    		if ('labelClasses' in $$props) $$invalidate(14, labelClasses = $$new_props.labelClasses);
    		if ('lClasses' in $$props) $$invalidate(0, lClasses = $$new_props.lClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focused, error, labelOnTop, outlined, bgColor, prepend, dense, add, remove, replace*/ 16120) {
    			$$invalidate(0, lClasses = l.flush().add(txt(), focused && !error).add("text-error-500", focused && error).add("label-top text-xs", labelOnTop).add("text-xs", focused).remove("pt-4 pb-2 px-4 px-1 pt-0", labelOnTop && outlined).add(`ml-3 p-1 pt-0 mt-0 bg-${bgColor} dark:bg-dark-500`, labelOnTop && outlined).remove("px-4", prepend).add("pr-4 pl-10", prepend).remove("pt-4", dense).add("pt-3", dense).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		lClasses,
    		props,
    		$$props,
    		focused,
    		error,
    		outlined,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		dense,
    		add,
    		remove,
    		replace,
    		labelClasses,
    		$$scope,
    		slots
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			focused: 3,
    			error: 4,
    			outlined: 5,
    			labelOnTop: 6,
    			prepend: 7,
    			color: 8,
    			bgColor: 9,
    			dense: 10,
    			add: 11,
    			remove: 12,
    			replace: 13,
    			labelClasses: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get focused() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelOnTop() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelOnTop(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClasses() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClasses(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* node_modules/smelte/src/components/TextField/Hint.svelte generated by Svelte v3.59.2 */
    const file$7 = "node_modules/smelte/src/components/TextField/Hint.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = (/*hint*/ ctx[1] || "") + "";
    	let t0;
    	let t1_value = (/*error*/ ctx[0] || "") + "";
    	let t1;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			html_tag = new HtmlTag(false);
    			t0 = space();
    			t1 = text(t1_value);
    			html_tag.a = t0;
    			attr_dev(div, "class", /*classes*/ ctx[3]);
    			add_location(div, file$7, 23, 0, 728);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*hint*/ 2) && raw_value !== (raw_value = (/*hint*/ ctx[1] || "") + "")) html_tag.p(raw_value);
    			if ((!current || dirty & /*error*/ 1) && t1_value !== (t1_value = (/*error*/ ctx[0] || "") + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*classes*/ 8) {
    				attr_dev(div, "class", /*classes*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[2], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[2], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hint', slots, []);
    	let classesDefault = "text-xs py-1 pl-4 absolute left-0";
    	let { error = false } = $$props;
    	let { hint = "" } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { transitionProps = { y: -10, duration: 100, easing: quadOut } } = $$props;
    	const l = new ClassBuilder($$props.class, classesDefault);
    	let Classes = i => i;
    	const props = filterProps(["error", "hint"], $$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('error' in $$new_props) $$invalidate(0, error = $$new_props.error);
    		if ('hint' in $$new_props) $$invalidate(1, hint = $$new_props.hint);
    		if ('add' in $$new_props) $$invalidate(4, add = $$new_props.add);
    		if ('remove' in $$new_props) $$invalidate(5, remove = $$new_props.remove);
    		if ('replace' in $$new_props) $$invalidate(6, replace = $$new_props.replace);
    		if ('transitionProps' in $$new_props) $$invalidate(2, transitionProps = $$new_props.transitionProps);
    	};

    	$$self.$capture_state = () => ({
    		ClassBuilder,
    		filterProps,
    		fly,
    		quadOut,
    		classesDefault,
    		error,
    		hint,
    		add,
    		remove,
    		replace,
    		transitionProps,
    		l,
    		Classes,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('classesDefault' in $$props) classesDefault = $$new_props.classesDefault;
    		if ('error' in $$props) $$invalidate(0, error = $$new_props.error);
    		if ('hint' in $$props) $$invalidate(1, hint = $$new_props.hint);
    		if ('add' in $$props) $$invalidate(4, add = $$new_props.add);
    		if ('remove' in $$props) $$invalidate(5, remove = $$new_props.remove);
    		if ('replace' in $$props) $$invalidate(6, replace = $$new_props.replace);
    		if ('transitionProps' in $$props) $$invalidate(2, transitionProps = $$new_props.transitionProps);
    		if ('Classes' in $$props) Classes = $$new_props.Classes;
    		if ('classes' in $$props) $$invalidate(3, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error, hint, add, remove, replace*/ 115) {
    			$$invalidate(3, classes = l.flush().add("text-error-500", error).add("text-gray-600", hint).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [error, hint, transitionProps, classes, add, remove, replace];
    }

    class Hint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			error: 0,
    			hint: 1,
    			add: 4,
    			remove: 5,
    			replace: 6,
    			transitionProps: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hint",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get error() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/Underline.svelte generated by Svelte v3.59.2 */
    const file$6 = "node_modules/smelte/src/components/TextField/Underline.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-io69p8"));
    			set_style(div0, "height", "2px");
    			set_style(div0, "transition", "width .2s ease");
    			add_location(div0, file$6, 39, 1, 1018);
    			attr_dev(div1, "class", div1_class_value = "line absolute bottom-0 left-0 w-full bg-gray-600 " + /*$$props*/ ctx[3].class + " svelte-io69p8");
    			toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			add_location(div1, file$6, 35, 0, 896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classes*/ 4 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-io69p8"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$$props*/ 8 && div1_class_value !== (div1_class_value = "line absolute bottom-0 left-0 w-full bg-gray-600 " + /*$$props*/ ctx[3].class + " svelte-io69p8")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$$props, noUnderline, outlined*/ 11) {
    				toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Underline', slots, []);
    	let { noUnderline = false } = $$props;
    	let { outlined = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { color = "primary" } = $$props;
    	let defaultClasses = `mx-auto w-0`;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { lineClasses = defaultClasses } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const l = new ClassBuilder(lineClasses, defaultClasses);
    	let Classes = i => i;
    	const props = filterProps(["focused", "error", "outlined", "labelOnTop", "prepend", "bgcolor", "color"], $$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('noUnderline' in $$new_props) $$invalidate(0, noUnderline = $$new_props.noUnderline);
    		if ('outlined' in $$new_props) $$invalidate(1, outlined = $$new_props.outlined);
    		if ('focused' in $$new_props) $$invalidate(4, focused = $$new_props.focused);
    		if ('error' in $$new_props) $$invalidate(5, error = $$new_props.error);
    		if ('color' in $$new_props) $$invalidate(6, color = $$new_props.color);
    		if ('add' in $$new_props) $$invalidate(7, add = $$new_props.add);
    		if ('remove' in $$new_props) $$invalidate(8, remove = $$new_props.remove);
    		if ('replace' in $$new_props) $$invalidate(9, replace = $$new_props.replace);
    		if ('lineClasses' in $$new_props) $$invalidate(10, lineClasses = $$new_props.lineClasses);
    	};

    	$$self.$capture_state = () => ({
    		utils,
    		ClassBuilder,
    		filterProps,
    		noUnderline,
    		outlined,
    		focused,
    		error,
    		color,
    		defaultClasses,
    		add,
    		remove,
    		replace,
    		lineClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		l,
    		Classes,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ('noUnderline' in $$props) $$invalidate(0, noUnderline = $$new_props.noUnderline);
    		if ('outlined' in $$props) $$invalidate(1, outlined = $$new_props.outlined);
    		if ('focused' in $$props) $$invalidate(4, focused = $$new_props.focused);
    		if ('error' in $$props) $$invalidate(5, error = $$new_props.error);
    		if ('color' in $$props) $$invalidate(6, color = $$new_props.color);
    		if ('defaultClasses' in $$props) defaultClasses = $$new_props.defaultClasses;
    		if ('add' in $$props) $$invalidate(7, add = $$new_props.add);
    		if ('remove' in $$props) $$invalidate(8, remove = $$new_props.remove);
    		if ('replace' in $$props) $$invalidate(9, replace = $$new_props.replace);
    		if ('lineClasses' in $$props) $$invalidate(10, lineClasses = $$new_props.lineClasses);
    		if ('Classes' in $$props) Classes = $$new_props.Classes;
    		if ('classes' in $$props) $$invalidate(2, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focused, error, add, remove, replace*/ 944) {
    			$$invalidate(2, classes = l.flush().add(txt(), focused && !error).add("bg-error-500", error).add("w-full", focused || error).add(bg(), focused).add(add).remove(remove).replace(replace).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		noUnderline,
    		outlined,
    		classes,
    		$$props,
    		focused,
    		error,
    		color,
    		add,
    		remove,
    		replace,
    		lineClasses
    	];
    }

    class Underline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			noUnderline: 0,
    			outlined: 1,
    			focused: 4,
    			error: 5,
    			color: 6,
    			add: 7,
    			remove: 8,
    			replace: 9,
    			lineClasses: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Underline",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get noUnderline() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineClasses() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineClasses(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/smelte/src/components/TextField/TextField.svelte generated by Svelte v3.59.2 */
    const file$5 = "node_modules/smelte/src/components/TextField/TextField.svelte";
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});
    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (116:1) {#if label}
    function create_if_block_6(ctx) {
    	let current;
    	const label_slot_template = /*#slots*/ ctx[40].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[69], get_label_slot_context);
    	const label_slot_or_fallback = label_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && (!current || dirty[2] & /*$$scope*/ 128)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[69],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[69])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[69], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && (!current || dirty[0] & /*labelOnTop, focused, error, outlined, prepend, color, bgColor, dense, label*/ 33952078)) {
    					label_slot_or_fallback.p(ctx, !current ? [-1, -1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(116:1) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (118:3) <Label     {labelOnTop}     {focused}     {error}     {outlined}     {prepend}     {color}     {bgColor}     dense={dense && !outlined}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*label*/ 8) set_data_dev(t, /*label*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(118:3) <Label     {labelOnTop}     {focused}     {error}     {outlined}     {prepend}     {color}     {bgColor}     dense={dense && !outlined}>",
    		ctx
    	});

    	return block;
    }

    // (117:21)     
    function fallback_block_2(ctx) {
    	let label_1;
    	let current;

    	label_1 = new Label({
    			props: {
    				labelOnTop: /*labelOnTop*/ ctx[25],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[6],
    				outlined: /*outlined*/ ctx[2],
    				prepend: /*prepend*/ ctx[8],
    				color: /*color*/ ctx[17],
    				bgColor: /*bgColor*/ ctx[18],
    				dense: /*dense*/ ctx[12] && !/*outlined*/ ctx[2],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_1_changes = {};
    			if (dirty[0] & /*labelOnTop*/ 33554432) label_1_changes.labelOnTop = /*labelOnTop*/ ctx[25];
    			if (dirty[0] & /*focused*/ 2) label_1_changes.focused = /*focused*/ ctx[1];
    			if (dirty[0] & /*error*/ 64) label_1_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*outlined*/ 4) label_1_changes.outlined = /*outlined*/ ctx[2];
    			if (dirty[0] & /*prepend*/ 256) label_1_changes.prepend = /*prepend*/ ctx[8];
    			if (dirty[0] & /*color*/ 131072) label_1_changes.color = /*color*/ ctx[17];
    			if (dirty[0] & /*bgColor*/ 262144) label_1_changes.bgColor = /*bgColor*/ ctx[18];
    			if (dirty[0] & /*dense, outlined*/ 4100) label_1_changes.dense = /*dense*/ ctx[12] && !/*outlined*/ ctx[2];

    			if (dirty[0] & /*label*/ 8 | dirty[2] & /*$$scope*/ 128) {
    				label_1_changes.$$scope = { dirty, ctx };
    			}

    			label_1.$set(label_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(117:21)     ",
    		ctx
    	});

    	return block;
    }

    // (170:35) 
    function create_if_block_5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			input.readOnly = true;
    			attr_dev(input, "class", /*iClasses*/ ctx[24]);
    			input.disabled = /*disabled*/ ctx[20];
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$5, 170, 2, 4613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler_2*/ ctx[57], false, false, false, false),
    					listen_dev(input, "input", /*input_handler_2*/ ctx[58], false, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_2*/ ctx[59], false, false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler_2*/ ctx[60], false, false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler_2*/ ctx[61], false, false, false, false),
    					listen_dev(input, "click", /*click_handler_2*/ ctx[62], false, false, false, false),
    					listen_dev(input, "blur", /*blur_handler_2*/ ctx[63], false, false, false, false),
    					listen_dev(input, "focus", /*focus_handler_2*/ ctx[64], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*iClasses*/ 16777216) {
    				attr_dev(input, "class", /*iClasses*/ ctx[24]);
    			}

    			if (dirty[0] & /*disabled*/ 1048576) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[20]);
    			}

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(170:35) ",
    		ctx
    	});

    	return block;
    }

    // (150:31) 
    function create_if_block_4(ctx) {
    	let textarea_1;
    	let textarea_1_placeholder_value;
    	let mounted;
    	let dispose;

    	let textarea_1_levels = [
    		{ rows: /*rows*/ ctx[10] },
    		{ "aria-label": /*label*/ ctx[3] },
    		{ class: /*iClasses*/ ctx[24] },
    		{ disabled: /*disabled*/ ctx[20] },
    		/*props*/ ctx[29],
    		{
    			placeholder: textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : ""
    		}
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_1_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			set_attributes(textarea_1, textarea_data);
    			add_location(textarea_1, file$5, 150, 2, 4267);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    			if (textarea_1.autofocus) textarea_1.focus();
    			set_input_value(textarea_1, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "change", /*change_handler_1*/ ctx[49], false, false, false, false),
    					listen_dev(textarea_1, "input", /*input_handler_1*/ ctx[50], false, false, false, false),
    					listen_dev(textarea_1, "keydown", /*keydown_handler_1*/ ctx[51], false, false, false, false),
    					listen_dev(textarea_1, "keypress", /*keypress_handler_1*/ ctx[52], false, false, false, false),
    					listen_dev(textarea_1, "keyup", /*keyup_handler_1*/ ctx[53], false, false, false, false),
    					listen_dev(textarea_1, "click", /*click_handler_1*/ ctx[54], false, false, false, false),
    					listen_dev(textarea_1, "focus", /*focus_handler_1*/ ctx[55], false, false, false, false),
    					listen_dev(textarea_1, "blur", /*blur_handler_1*/ ctx[56], false, false, false, false),
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[66]),
    					listen_dev(textarea_1, "focus", /*toggleFocused*/ ctx[28], false, false, false, false),
    					listen_dev(textarea_1, "blur", /*toggleFocused*/ ctx[28], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea_1, textarea_data = get_spread_update(textarea_1_levels, [
    				dirty[0] & /*rows*/ 1024 && { rows: /*rows*/ ctx[10] },
    				dirty[0] & /*label*/ 8 && { "aria-label": /*label*/ ctx[3] },
    				dirty[0] & /*iClasses*/ 16777216 && { class: /*iClasses*/ ctx[24] },
    				dirty[0] & /*disabled*/ 1048576 && { disabled: /*disabled*/ ctx[20] },
    				/*props*/ ctx[29],
    				dirty[0] & /*value, placeholder*/ 17 && textarea_1_placeholder_value !== (textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : "") && {
    					placeholder: textarea_1_placeholder_value
    				}
    			]));

    			if (dirty[0] & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(150:31) ",
    		ctx
    	});

    	return block;
    }

    // (131:1) {#if (!textarea && !select) || autocomplete}
    function create_if_block_3(ctx) {
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ "aria-label": /*label*/ ctx[3] },
    		{ class: /*iClasses*/ ctx[24] },
    		{ disabled: /*disabled*/ ctx[20] },
    		/*props*/ ctx[29],
    		{
    			placeholder: input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : ""
    		}
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$5, 131, 2, 3938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			if (input.autofocus) input.focus();
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "focus", /*toggleFocused*/ ctx[28], false, false, false, false),
    					listen_dev(input, "blur", /*toggleFocused*/ ctx[28], false, false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[41], false, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[65]),
    					listen_dev(input, "change", /*change_handler*/ ctx[42], false, false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[43], false, false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[44], false, false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[45], false, false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[46], false, false, false, false),
    					listen_dev(input, "click", /*click_handler*/ ctx[47], false, false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[48], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty[0] & /*label*/ 8 && { "aria-label": /*label*/ ctx[3] },
    				dirty[0] & /*iClasses*/ 16777216 && { class: /*iClasses*/ ctx[24] },
    				dirty[0] & /*disabled*/ 1048576 && { disabled: /*disabled*/ ctx[20] },
    				/*props*/ ctx[29],
    				dirty[0] & /*value, placeholder*/ 17 && input_placeholder_value !== (input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[4] : "") && { placeholder: input_placeholder_value }
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(131:1) {#if (!textarea && !select) || autocomplete}",
    		ctx
    	});

    	return block;
    }

    // (187:1) {#if append}
    function create_if_block_2(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const append_slot_template = /*#slots*/ ctx[40].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[69], get_append_slot_context);
    	const append_slot_or_fallback = append_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (append_slot_or_fallback) append_slot_or_fallback.c();
    			attr_dev(div, "class", /*aClasses*/ ctx[22]);
    			add_location(div, file$5, 187, 2, 4807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (append_slot_or_fallback) {
    				append_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[67], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (append_slot) {
    				if (append_slot.p && (!current || dirty[2] & /*$$scope*/ 128)) {
    					update_slot_base(
    						append_slot,
    						append_slot_template,
    						ctx,
    						/*$$scope*/ ctx[69],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[69])
    						: get_slot_changes(append_slot_template, /*$$scope*/ ctx[69], dirty, get_append_slot_changes),
    						get_append_slot_context
    					);
    				}
    			} else {
    				if (append_slot_or_fallback && append_slot_or_fallback.p && (!current || dirty[0] & /*appendReverse, focused, iconClass, append*/ 557186)) {
    					append_slot_or_fallback.p(ctx, !current ? [-1, -1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*aClasses*/ 4194304) {
    				attr_dev(div, "class", /*aClasses*/ ctx[22]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (append_slot_or_fallback) append_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(187:1) {#if append}",
    		ctx
    	});

    	return block;
    }

    // (190:4) <Icon      reverse={appendReverse}      class="{focused ? txt() : ''} {iconClass}"     >
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*append*/ ctx[7]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*append*/ 128) set_data_dev(t, /*append*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(190:4) <Icon      reverse={appendReverse}      class=\\\"{focused ? txt() : ''} {iconClass}\\\"     >",
    		ctx
    	});

    	return block;
    }

    // (189:23)      
    function fallback_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				reverse: /*appendReverse*/ ctx[15],
    				class: "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : '') + " " + /*iconClass*/ ctx[19]),
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty[0] & /*appendReverse*/ 32768) icon_changes.reverse = /*appendReverse*/ ctx[15];
    			if (dirty[0] & /*focused, iconClass*/ 524290) icon_changes.class = "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : '') + " " + /*iconClass*/ ctx[19]);

    			if (dirty[0] & /*append*/ 128 | dirty[2] & /*$$scope*/ 128) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(189:23)      ",
    		ctx
    	});

    	return block;
    }

    // (200:1) {#if prepend}
    function create_if_block_1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[40].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[69], get_prepend_slot_context);
    	const prepend_slot_or_fallback = prepend_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.c();
    			attr_dev(div, "class", /*pClasses*/ ctx[23]);
    			add_location(div, file$5, 200, 2, 5060);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (prepend_slot_or_fallback) {
    				prepend_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_4*/ ctx[68], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && (!current || dirty[2] & /*$$scope*/ 128)) {
    					update_slot_base(
    						prepend_slot,
    						prepend_slot_template,
    						ctx,
    						/*$$scope*/ ctx[69],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[69])
    						: get_slot_changes(prepend_slot_template, /*$$scope*/ ctx[69], dirty, get_prepend_slot_changes),
    						get_prepend_slot_context
    					);
    				}
    			} else {
    				if (prepend_slot_or_fallback && prepend_slot_or_fallback.p && (!current || dirty[0] & /*prependReverse, focused, iconClass, prepend*/ 590082)) {
    					prepend_slot_or_fallback.p(ctx, !current ? [-1, -1, -1] : dirty);
    				}
    			}

    			if (!current || dirty[0] & /*pClasses*/ 8388608) {
    				attr_dev(div, "class", /*pClasses*/ ctx[23]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (prepend_slot_or_fallback) prepend_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(200:1) {#if prepend}",
    		ctx
    	});

    	return block;
    }

    // (203:4) <Icon      reverse={prependReverse}      class="{focused ? txt() : ''} {iconClass}"     >
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*prepend*/ ctx[8]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*prepend*/ 256) set_data_dev(t, /*prepend*/ ctx[8]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(203:4) <Icon      reverse={prependReverse}      class=\\\"{focused ? txt() : ''} {iconClass}\\\"     >",
    		ctx
    	});

    	return block;
    }

    // (202:24)      
    function fallback_block(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				reverse: /*prependReverse*/ ctx[16],
    				class: "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : '') + " " + /*iconClass*/ ctx[19]),
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty[0] & /*prependReverse*/ 65536) icon_changes.reverse = /*prependReverse*/ ctx[16];
    			if (dirty[0] & /*focused, iconClass*/ 524290) icon_changes.class = "" + ((/*focused*/ ctx[1] ? /*txt*/ ctx[27]() : '') + " " + /*iconClass*/ ctx[19]);

    			if (dirty[0] & /*prepend*/ 256 | dirty[2] & /*$$scope*/ 128) {
    				icon_changes.$$scope = { dirty, ctx };
    			}

    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(202:24)      ",
    		ctx
    	});

    	return block;
    }

    // (215:1) {#if showHint}
    function create_if_block(ctx) {
    	let hint_1;
    	let current;

    	hint_1 = new Hint({
    			props: {
    				error: /*error*/ ctx[6],
    				hint: /*hint*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hint_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hint_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hint_1_changes = {};
    			if (dirty[0] & /*error*/ 64) hint_1_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*hint*/ 32) hint_1_changes.hint = /*hint*/ ctx[5];
    			hint_1.$set(hint_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hint_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hint_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hint_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(215:1) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let underline;
    	let t4;
    	let current;
    	let if_block0 = /*label*/ ctx[3] && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*textarea*/ ctx[9] && !/*select*/ ctx[11] || /*autocomplete*/ ctx[13]) return create_if_block_3;
    		if (/*textarea*/ ctx[9] && !/*select*/ ctx[11]) return create_if_block_4;
    		if (/*select*/ ctx[11] && !/*autocomplete*/ ctx[13]) return create_if_block_5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);
    	let if_block2 = /*append*/ ctx[7] && create_if_block_2(ctx);
    	let if_block3 = /*prepend*/ ctx[8] && create_if_block_1(ctx);

    	underline = new Underline({
    			props: {
    				noUnderline: /*noUnderline*/ ctx[14],
    				outlined: /*outlined*/ ctx[2],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[6],
    				color: /*color*/ ctx[17]
    			},
    			$$inline: true
    		});

    	let if_block4 = /*showHint*/ ctx[26] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			create_component(underline.$$.fragment);
    			t4 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(div, "class", /*wClasses*/ ctx[21]);
    			add_location(div, file$5, 114, 0, 3655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			mount_component(underline, div, null);
    			append_dev(div, t4);
    			if (if_block4) if_block4.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*label*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			}

    			if (/*append*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*append*/ 128) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*prepend*/ ctx[8]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*prepend*/ 256) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			const underline_changes = {};
    			if (dirty[0] & /*noUnderline*/ 16384) underline_changes.noUnderline = /*noUnderline*/ ctx[14];
    			if (dirty[0] & /*outlined*/ 4) underline_changes.outlined = /*outlined*/ ctx[2];
    			if (dirty[0] & /*focused*/ 2) underline_changes.focused = /*focused*/ ctx[1];
    			if (dirty[0] & /*error*/ 64) underline_changes.error = /*error*/ ctx[6];
    			if (dirty[0] & /*color*/ 131072) underline_changes.color = /*color*/ ctx[17];
    			underline.$set(underline_changes);

    			if (/*showHint*/ ctx[26]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*showHint*/ 67108864) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*wClasses*/ 2097152) {
    				attr_dev(div, "class", /*wClasses*/ ctx[21]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(underline.$$.fragment, local);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(underline.$$.fragment, local);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			destroy_component(underline);
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const inputDefault = "pb-2 pt-6 px-4 rounded-t text-black dark:text-gray-100 w-full";
    const classesDefault = "mt-2 mb-6 relative text-gray-600 dark:text-gray-100";
    const appendDefault = "absolute right-0 top-0 pb-2 pr-4 pt-4 text-gray-700 z-10";
    const prependDefault = "absolute left-0 top-0 pb-2 pl-2 pt-4 text-xs text-gray-700 z-10";

    function instance$5($$self, $$props, $$invalidate) {
    	let showHint;
    	let labelOnTop;
    	let iClasses;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextField', slots, ['label','append','prepend']);
    	let { outlined = false } = $$props;
    	let { value = null } = $$props;
    	let { label = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { hint = "" } = $$props;
    	let { error = false } = $$props;
    	let { append = "" } = $$props;
    	let { prepend = "" } = $$props;
    	let { persistentHint = false } = $$props;
    	let { textarea = false } = $$props;
    	let { rows = 5 } = $$props;
    	let { select = false } = $$props;
    	let { dense = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { appendReverse = false } = $$props;
    	let { prependReverse = false } = $$props;
    	let { color = "primary" } = $$props;
    	let { bgColor = "white" } = $$props;
    	let { iconClass = "" } = $$props;
    	let { disabled = false } = $$props;
    	let { add = "" } = $$props;
    	let { remove = "" } = $$props;
    	let { replace = "" } = $$props;
    	let { inputClasses = inputDefault } = $$props;
    	let { classes = classesDefault } = $$props;
    	let { appendClasses = appendDefault } = $$props;
    	let { prependClasses = prependDefault } = $$props;
    	const { bg, border, txt, caret } = utils(color);
    	const cb = new ClassBuilder(inputClasses, inputDefault);
    	const ccb = new ClassBuilder(classes, classesDefault);
    	const acb = new ClassBuilder(appendClasses, appendDefault);
    	const pcb = new ClassBuilder(prependClasses, prependDefault);

    	let { extend = () => {
    		
    	} } = $$props;

    	let { focused = false } = $$props;
    	let wClasses = i => i;
    	let aClasses = i => i;
    	let pClasses = i => i;

    	function toggleFocused() {
    		$$invalidate(1, focused = !focused);
    	}

    	const props = filterProps(
    		[
    			"outlined",
    			"label",
    			"placeholder",
    			"hint",
    			"error",
    			"append",
    			"prepend",
    			"persistentHint",
    			"textarea",
    			"rows",
    			"select",
    			"autocomplete",
    			"noUnderline",
    			"appendReverse",
    			"prependReverse",
    			"color",
    			"bgColor",
    			"disabled",
    			"replace",
    			"remove",
    			"small"
    		],
    		$$props
    	);

    	const dispatch = createEventDispatcher();

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	const click_handler_3 = () => dispatch("click-append");
    	const click_handler_4 = () => dispatch("click-prepend");

    	$$self.$$set = $$new_props => {
    		$$invalidate(77, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('outlined' in $$new_props) $$invalidate(2, outlined = $$new_props.outlined);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('label' in $$new_props) $$invalidate(3, label = $$new_props.label);
    		if ('placeholder' in $$new_props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ('hint' in $$new_props) $$invalidate(5, hint = $$new_props.hint);
    		if ('error' in $$new_props) $$invalidate(6, error = $$new_props.error);
    		if ('append' in $$new_props) $$invalidate(7, append = $$new_props.append);
    		if ('prepend' in $$new_props) $$invalidate(8, prepend = $$new_props.prepend);
    		if ('persistentHint' in $$new_props) $$invalidate(31, persistentHint = $$new_props.persistentHint);
    		if ('textarea' in $$new_props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ('rows' in $$new_props) $$invalidate(10, rows = $$new_props.rows);
    		if ('select' in $$new_props) $$invalidate(11, select = $$new_props.select);
    		if ('dense' in $$new_props) $$invalidate(12, dense = $$new_props.dense);
    		if ('autocomplete' in $$new_props) $$invalidate(13, autocomplete = $$new_props.autocomplete);
    		if ('noUnderline' in $$new_props) $$invalidate(14, noUnderline = $$new_props.noUnderline);
    		if ('appendReverse' in $$new_props) $$invalidate(15, appendReverse = $$new_props.appendReverse);
    		if ('prependReverse' in $$new_props) $$invalidate(16, prependReverse = $$new_props.prependReverse);
    		if ('color' in $$new_props) $$invalidate(17, color = $$new_props.color);
    		if ('bgColor' in $$new_props) $$invalidate(18, bgColor = $$new_props.bgColor);
    		if ('iconClass' in $$new_props) $$invalidate(19, iconClass = $$new_props.iconClass);
    		if ('disabled' in $$new_props) $$invalidate(20, disabled = $$new_props.disabled);
    		if ('add' in $$new_props) $$invalidate(32, add = $$new_props.add);
    		if ('remove' in $$new_props) $$invalidate(33, remove = $$new_props.remove);
    		if ('replace' in $$new_props) $$invalidate(34, replace = $$new_props.replace);
    		if ('inputClasses' in $$new_props) $$invalidate(35, inputClasses = $$new_props.inputClasses);
    		if ('classes' in $$new_props) $$invalidate(36, classes = $$new_props.classes);
    		if ('appendClasses' in $$new_props) $$invalidate(37, appendClasses = $$new_props.appendClasses);
    		if ('prependClasses' in $$new_props) $$invalidate(38, prependClasses = $$new_props.prependClasses);
    		if ('extend' in $$new_props) $$invalidate(39, extend = $$new_props.extend);
    		if ('focused' in $$new_props) $$invalidate(1, focused = $$new_props.focused);
    		if ('$$scope' in $$new_props) $$invalidate(69, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		utils,
    		ClassBuilder,
    		filterProps,
    		Icon,
    		Label,
    		Hint,
    		Underline,
    		outlined,
    		value,
    		label,
    		placeholder,
    		hint,
    		error,
    		append,
    		prepend,
    		persistentHint,
    		textarea,
    		rows,
    		select,
    		dense,
    		autocomplete,
    		noUnderline,
    		appendReverse,
    		prependReverse,
    		color,
    		bgColor,
    		iconClass,
    		disabled,
    		inputDefault,
    		classesDefault,
    		appendDefault,
    		prependDefault,
    		add,
    		remove,
    		replace,
    		inputClasses,
    		classes,
    		appendClasses,
    		prependClasses,
    		bg,
    		border,
    		txt,
    		caret,
    		cb,
    		ccb,
    		acb,
    		pcb,
    		extend,
    		focused,
    		wClasses,
    		aClasses,
    		pClasses,
    		toggleFocused,
    		props,
    		dispatch,
    		iClasses,
    		labelOnTop,
    		showHint
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(77, $$props = assign(assign({}, $$props), $$new_props));
    		if ('outlined' in $$props) $$invalidate(2, outlined = $$new_props.outlined);
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('label' in $$props) $$invalidate(3, label = $$new_props.label);
    		if ('placeholder' in $$props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ('hint' in $$props) $$invalidate(5, hint = $$new_props.hint);
    		if ('error' in $$props) $$invalidate(6, error = $$new_props.error);
    		if ('append' in $$props) $$invalidate(7, append = $$new_props.append);
    		if ('prepend' in $$props) $$invalidate(8, prepend = $$new_props.prepend);
    		if ('persistentHint' in $$props) $$invalidate(31, persistentHint = $$new_props.persistentHint);
    		if ('textarea' in $$props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ('rows' in $$props) $$invalidate(10, rows = $$new_props.rows);
    		if ('select' in $$props) $$invalidate(11, select = $$new_props.select);
    		if ('dense' in $$props) $$invalidate(12, dense = $$new_props.dense);
    		if ('autocomplete' in $$props) $$invalidate(13, autocomplete = $$new_props.autocomplete);
    		if ('noUnderline' in $$props) $$invalidate(14, noUnderline = $$new_props.noUnderline);
    		if ('appendReverse' in $$props) $$invalidate(15, appendReverse = $$new_props.appendReverse);
    		if ('prependReverse' in $$props) $$invalidate(16, prependReverse = $$new_props.prependReverse);
    		if ('color' in $$props) $$invalidate(17, color = $$new_props.color);
    		if ('bgColor' in $$props) $$invalidate(18, bgColor = $$new_props.bgColor);
    		if ('iconClass' in $$props) $$invalidate(19, iconClass = $$new_props.iconClass);
    		if ('disabled' in $$props) $$invalidate(20, disabled = $$new_props.disabled);
    		if ('add' in $$props) $$invalidate(32, add = $$new_props.add);
    		if ('remove' in $$props) $$invalidate(33, remove = $$new_props.remove);
    		if ('replace' in $$props) $$invalidate(34, replace = $$new_props.replace);
    		if ('inputClasses' in $$props) $$invalidate(35, inputClasses = $$new_props.inputClasses);
    		if ('classes' in $$props) $$invalidate(36, classes = $$new_props.classes);
    		if ('appendClasses' in $$props) $$invalidate(37, appendClasses = $$new_props.appendClasses);
    		if ('prependClasses' in $$props) $$invalidate(38, prependClasses = $$new_props.prependClasses);
    		if ('extend' in $$props) $$invalidate(39, extend = $$new_props.extend);
    		if ('focused' in $$props) $$invalidate(1, focused = $$new_props.focused);
    		if ('wClasses' in $$props) $$invalidate(21, wClasses = $$new_props.wClasses);
    		if ('aClasses' in $$props) $$invalidate(22, aClasses = $$new_props.aClasses);
    		if ('pClasses' in $$props) $$invalidate(23, pClasses = $$new_props.pClasses);
    		if ('iClasses' in $$props) $$invalidate(24, iClasses = $$new_props.iClasses);
    		if ('labelOnTop' in $$props) $$invalidate(25, labelOnTop = $$new_props.labelOnTop);
    		if ('showHint' in $$props) $$invalidate(26, showHint = $$new_props.showHint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*error, hint, focused*/ 98 | $$self.$$.dirty[1] & /*persistentHint*/ 1) {
    			$$invalidate(26, showHint = error || (persistentHint ? hint : focused && hint));
    		}

    		if ($$self.$$.dirty[0] & /*placeholder, focused, value*/ 19) {
    			$$invalidate(25, labelOnTop = placeholder || focused || value || value === 0);
    		}

    		$$invalidate(24, iClasses = cb.flush().remove("pt-6 pb-2", outlined).add("border rounded bg-transparent py-4 duration-200 ease-in", outlined).add("border-error-500 caret-error-500", error).remove(caret(), error).add(caret(), !error).add(border(), outlined && focused && !error).add("bg-gray-100 dark:bg-dark-600", !outlined).add("bg-gray-300 dark:bg-dark-200", focused && !outlined).remove("px-4", prepend).add("pr-4 pl-10", prepend).add(add).remove("pt-6 pb-2", dense && !outlined).add("pt-4 pb-1", dense && !outlined).remove("bg-gray-100", disabled).add("bg-gray-50", disabled).add("cursor-pointer", select && !autocomplete).add($$props.class).remove(remove).replace(replace).extend(extend).get());

    		if ($$self.$$.dirty[0] & /*select, autocomplete, dense, outlined, error, disabled*/ 1062980) {
    			$$invalidate(21, wClasses = ccb.flush().add("select", select || autocomplete).add("dense", dense && !outlined).remove("mb-6 mt-2", dense && !outlined).add("mb-4 mt-1", dense).replace({ "text-gray-600": "text-error-500" }, error).add("text-gray-200", disabled).get());
    		}
    	};

    	$$invalidate(22, aClasses = acb.flush().get());
    	$$invalidate(23, pClasses = pcb.flush().get());
    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		focused,
    		outlined,
    		label,
    		placeholder,
    		hint,
    		error,
    		append,
    		prepend,
    		textarea,
    		rows,
    		select,
    		dense,
    		autocomplete,
    		noUnderline,
    		appendReverse,
    		prependReverse,
    		color,
    		bgColor,
    		iconClass,
    		disabled,
    		wClasses,
    		aClasses,
    		pClasses,
    		iClasses,
    		labelOnTop,
    		showHint,
    		txt,
    		toggleFocused,
    		props,
    		dispatch,
    		persistentHint,
    		add,
    		remove,
    		replace,
    		inputClasses,
    		classes,
    		appendClasses,
    		prependClasses,
    		extend,
    		slots,
    		blur_handler,
    		change_handler,
    		input_handler,
    		keydown_handler,
    		keypress_handler,
    		keyup_handler,
    		click_handler,
    		focus_handler,
    		change_handler_1,
    		input_handler_1,
    		keydown_handler_1,
    		keypress_handler_1,
    		keyup_handler_1,
    		click_handler_1,
    		focus_handler_1,
    		blur_handler_1,
    		change_handler_2,
    		input_handler_2,
    		keydown_handler_2,
    		keypress_handler_2,
    		keyup_handler_2,
    		click_handler_2,
    		blur_handler_2,
    		focus_handler_2,
    		input_input_handler,
    		textarea_1_input_handler,
    		click_handler_3,
    		click_handler_4,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				outlined: 2,
    				value: 0,
    				label: 3,
    				placeholder: 4,
    				hint: 5,
    				error: 6,
    				append: 7,
    				prepend: 8,
    				persistentHint: 31,
    				textarea: 9,
    				rows: 10,
    				select: 11,
    				dense: 12,
    				autocomplete: 13,
    				noUnderline: 14,
    				appendReverse: 15,
    				prependReverse: 16,
    				color: 17,
    				bgColor: 18,
    				iconClass: 19,
    				disabled: 20,
    				add: 32,
    				remove: 33,
    				replace: 34,
    				inputClasses: 35,
    				classes: 36,
    				appendClasses: 37,
    				prependClasses: 38,
    				extend: 39,
    				focused: 1
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get append() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set append(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendReverse() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendReverse(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependReverse() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependReverse(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appendClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appendClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prependClasses() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prependClasses(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Word.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/Word.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let smallbutton0;
    	let t0;
    	let div0;
    	let textfield;
    	let updating_value;
    	let t1;
    	let smallbutton1;
    	let t2;
    	let smallbutton2;
    	let current;

    	smallbutton0 = new SmallButton({
    			props: { color: "blue", icon: "close", title: "" },
    			$$inline: true
    		});

    	smallbutton0.$on("click", /*click_handler*/ ctx[5]);

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[6](value);
    	}

    	let textfield_props = { placeholder: "Word" };

    	if (/*word*/ ctx[0].text !== void 0) {
    		textfield_props.value = /*word*/ ctx[0].text;
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, 'value', textfield_value_binding));
    	textfield.$on("keyup", /*keyup_handler*/ ctx[4]);

    	smallbutton1 = new SmallButton({
    			props: {
    				color: "success",
    				icon: "check",
    				title: /*word*/ ctx[0].correct ? "yay" : ""
    			},
    			$$inline: true
    		});

    	smallbutton1.$on("click", /*click_handler_1*/ ctx[7]);

    	smallbutton2 = new SmallButton({
    			props: {
    				color: "alert",
    				icon: "close",
    				title: /*word*/ ctx[0].correct === false ? "boo" : ""
    			},
    			$$inline: true
    		});

    	smallbutton2.$on("click", /*click_handler_2*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(smallbutton0.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(textfield.$$.fragment);
    			t1 = space();
    			create_component(smallbutton1.$$.fragment);
    			t2 = space();
    			create_component(smallbutton2.$$.fragment);
    			attr_dev(div0, "class", "word svelte-1id9zxc");
    			add_location(div0, file$4, 27, 1, 647);
    			attr_dev(div1, "class", "word-container svelte-1id9zxc");
    			add_location(div1, file$4, 20, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(smallbutton0, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			mount_component(textfield, div0, null);
    			append_dev(div1, t1);
    			mount_component(smallbutton1, div1, null);
    			append_dev(div1, t2);
    			mount_component(smallbutton2, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*word*/ 1) {
    				updating_value = true;
    				textfield_changes.value = /*word*/ ctx[0].text;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    			const smallbutton1_changes = {};
    			if (dirty & /*word*/ 1) smallbutton1_changes.title = /*word*/ ctx[0].correct ? "yay" : "";
    			smallbutton1.$set(smallbutton1_changes);
    			const smallbutton2_changes = {};
    			if (dirty & /*word*/ 1) smallbutton2_changes.title = /*word*/ ctx[0].correct === false ? "boo" : "";
    			smallbutton2.$set(smallbutton2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(smallbutton0.$$.fragment, local);
    			transition_in(textfield.$$.fragment, local);
    			transition_in(smallbutton1.$$.fragment, local);
    			transition_in(smallbutton2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(smallbutton0.$$.fragment, local);
    			transition_out(textfield.$$.fragment, local);
    			transition_out(smallbutton1.$$.fragment, local);
    			transition_out(smallbutton2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(smallbutton0);
    			destroy_component(textfield);
    			destroy_component(smallbutton1);
    			destroy_component(smallbutton2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Word', slots, []);
    	let { word } = $$props;
    	let dispatch = createEventDispatcher();

    	function mark_word_correct() {
    		$$invalidate(0, word.correct = true, word);
    		dispatch("correct");
    	}

    	function mark_word_incorrect() {
    		$$invalidate(0, word.correct = false, word);
    		dispatch("incorrect");
    	}

    	function keyup_handler(event) {
    		if (event.key === "Enter") {
    			dispatch("add_word");
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (word === undefined && !('word' in $$props || $$self.$$.bound[$$self.$$.props['word']])) {
    			console.warn("<Word> was created without expected prop 'word'");
    		}
    	});

    	const writable_props = ['word'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Word> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("delete");

    	function textfield_value_binding(value) {
    		if ($$self.$$.not_equal(word.text, value)) {
    			word.text = value;
    			$$invalidate(0, word);
    		}
    	}

    	const click_handler_1 = () => mark_word_correct();
    	const click_handler_2 = () => mark_word_incorrect();

    	$$self.$$set = $$props => {
    		if ('word' in $$props) $$invalidate(0, word = $$props.word);
    	};

    	$$self.$capture_state = () => ({
    		SmallButton,
    		TextField,
    		createEventDispatcher,
    		word,
    		dispatch,
    		mark_word_correct,
    		mark_word_incorrect,
    		keyup_handler
    	});

    	$$self.$inject_state = $$props => {
    		if ('word' in $$props) $$invalidate(0, word = $$props.word);
    		if ('dispatch' in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		word,
    		dispatch,
    		mark_word_correct,
    		mark_word_incorrect,
    		keyup_handler,
    		click_handler,
    		textfield_value_binding,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Word extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { word: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Word",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get word() {
    		throw new Error("<Word>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set word(value) {
    		throw new Error("<Word>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Player.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/Player.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (35:2) {#each player.words as word, i}
    function create_each_block$1(ctx) {
    	let word;
    	let updating_word;
    	let current;

    	function word_word_binding(value) {
    		/*word_word_binding*/ ctx[7](value, /*word*/ ctx[13], /*each_value*/ ctx[14], /*i*/ ctx[15]);
    	}

    	function delete_handler() {
    		return /*delete_handler*/ ctx[8](/*word*/ ctx[13]);
    	}

    	function correct_handler() {
    		return /*correct_handler*/ ctx[10](/*i*/ ctx[15]);
    	}

    	function incorrect_handler() {
    		return /*incorrect_handler*/ ctx[11](/*i*/ ctx[15]);
    	}

    	let word_props = {};

    	if (/*word*/ ctx[13] !== void 0) {
    		word_props.word = /*word*/ ctx[13];
    	}

    	word = new Word({ props: word_props, $$inline: true });
    	binding_callbacks.push(() => bind(word, 'word', word_word_binding));
    	word.$on("delete", delete_handler);
    	word.$on("add_word", /*add_word_handler*/ ctx[9]);
    	word.$on("correct", correct_handler);
    	word.$on("incorrect", incorrect_handler);

    	const block = {
    		c: function create() {
    			create_component(word.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(word, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const word_changes = {};

    			if (!updating_word && dirty & /*player*/ 1) {
    				updating_word = true;
    				word_changes.word = /*word*/ ctx[13];
    				add_flush_callback(() => updating_word = false);
    			}

    			word.$set(word_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(word.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(word.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(word, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(35:2) {#each player.words as word, i}",
    		ctx
    	});

    	return block;
    }

    // (45:2) <Button    color="blue"    remove="p-4"    icon="plus"    title="Add word"    on:click={() => add_word()}   >
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add word");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(45:2) <Button    color=\\\"blue\\\"    remove=\\\"p-4\\\"    icon=\\\"plus\\\"    title=\\\"Add word\\\"    on:click={() => add_word()}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let smallbutton;
    	let t0;
    	let div1;
    	let textfield;
    	let updating_value;
    	let t1;
    	let t2;
    	let button;
    	let current;

    	smallbutton = new SmallButton({
    			props: { color: "blue", icon: "close", title: "" },
    			$$inline: true
    		});

    	smallbutton.$on("click", /*click_handler*/ ctx[5]);

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[6](value);
    	}

    	let textfield_props = { placeholder: "Name" };

    	if (/*player*/ ctx[0].name !== void 0) {
    		textfield_props.value = /*player*/ ctx[0].name;
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield, 'value', textfield_value_binding));
    	let each_value = /*player*/ ctx[0].words;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	button = new Button({
    			props: {
    				color: "blue",
    				remove: "p-4",
    				icon: "plus",
    				title: "Add word",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[12]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(smallbutton.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(textfield.$$.fragment);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			create_component(button.$$.fragment);
    			add_location(div0, file$3, 22, 1, 721);
    			attr_dev(div1, "class", "player-content svelte-o0ed02");
    			add_location(div1, file$3, 31, 1, 840);
    			attr_dev(div2, "class", "player-container m-2 p-2 bg-white dark:bg-gray-600 duration-200 rounded ease-in shadow-sm hover:shadow svelte-o0ed02");
    			add_location(div2, file$3, 19, 0, 601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(smallbutton, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(textfield, div1, null);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div1, t2);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*player*/ 1) {
    				updating_value = true;
    				textfield_changes.value = /*player*/ ctx[0].name;
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);

    			if (dirty & /*player, delete_word, add_word, mark_word_correct*/ 29) {
    				each_value = /*player*/ ctx[0].words;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(smallbutton.$$.fragment, local);
    			transition_in(textfield.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(smallbutton.$$.fragment, local);
    			transition_out(textfield.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(smallbutton);
    			destroy_component(textfield);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Player', slots, []);
    	let { player } = $$props;
    	let dispatch = createEventDispatcher();

    	function delete_word(wordToDelete) {
    		$$invalidate(0, player.words = player.words.filter(word => word !== wordToDelete), player);
    	}

    	function mark_word_correct(i, correct) {
    		dispatch("player_update");
    	}

    	function add_word() {
    		player.words.push({ text: "" });
    		$$invalidate(0, player);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (player === undefined && !('player' in $$props || $$self.$$.bound[$$self.$$.props['player']])) {
    			console.warn("<Player> was created without expected prop 'player'");
    		}
    	});

    	const writable_props = ['player'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("delete");

    	function textfield_value_binding(value) {
    		if ($$self.$$.not_equal(player.name, value)) {
    			player.name = value;
    			$$invalidate(0, player);
    		}
    	}

    	function word_word_binding(value, word, each_value, i) {
    		each_value[i] = value;
    		$$invalidate(0, player);
    	}

    	const delete_handler = word => delete_word(word);
    	const add_word_handler = () => add_word();
    	const correct_handler = i => mark_word_correct();
    	const incorrect_handler = i => mark_word_correct();
    	const click_handler_1 = () => add_word();

    	$$self.$$set = $$props => {
    		if ('player' in $$props) $$invalidate(0, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		SmallButton,
    		Word,
    		TextField,
    		createEventDispatcher,
    		player,
    		dispatch,
    		delete_word,
    		mark_word_correct,
    		add_word
    	});

    	$$self.$inject_state = $$props => {
    		if ('player' in $$props) $$invalidate(0, player = $$props.player);
    		if ('dispatch' in $$props) $$invalidate(1, dispatch = $$props.dispatch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		player,
    		dispatch,
    		delete_word,
    		mark_word_correct,
    		add_word,
    		click_handler,
    		textfield_value_binding,
    		word_word_binding,
    		delete_handler,
    		add_word_handler,
    		correct_handler,
    		incorrect_handler,
    		click_handler_1
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { player: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get player() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Content.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/Content.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (26:1) {#each players as player}
    function create_each_block(ctx) {
    	let player;
    	let current;

    	function delete_handler() {
    		return /*delete_handler*/ ctx[3](/*player*/ ctx[6]);
    	}

    	function player_update_handler() {
    		return /*player_update_handler*/ ctx[4](/*player*/ ctx[6]);
    	}

    	player = new Player({
    			props: { player: /*player*/ ctx[6] },
    			$$inline: true
    		});

    	player.$on("delete", delete_handler);
    	player.$on("player_update", player_update_handler);

    	const block = {
    		c: function create() {
    			create_component(player.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(player, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const player_changes = {};
    			if (dirty & /*players*/ 1) player_changes.player = /*player*/ ctx[6];
    			player.$set(player_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(player.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(player.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(player, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:1) {#each players as player}",
    		ctx
    	});

    	return block;
    }

    // (37:2) <Button    color="blue"    remove="p-4"    icon="plus"    title="Add player"    on:click={() => add_player()}   >
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Add player");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(37:2) <Button    color=\\\"blue\\\"    remove=\\\"p-4\\\"    icon=\\\"plus\\\"    title=\\\"Add player\\\"    on:click={() => add_player()}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let button;
    	let current;
    	let each_value = /*players*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	button = new Button({
    			props: {
    				color: "blue",
    				remove: "p-4",
    				icon: "plus",
    				title: "Add player",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div0 = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "m-2 p-2 bg-white dark:bg-gray-600 duration-200 rounded ease-in shadow-sm hover:shadow");
    			add_location(div0, file$2, 33, 1, 722);
    			add_location(div1, file$2, 24, 0, 558);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(button, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*players, delete_player, update_player*/ 3) {
    				each_value = /*players*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function update_player(player) {
    	
    } // TODO: update scores, I guess?

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Content', slots, []);

    	let players = [
    		{
    			name: "michael",
    			words: [{ text: "apple" }]
    		},
    		{ name: "ian", words: [{ text: "banana" }] }
    	];

    	function delete_player(playerToDelete) {
    		$$invalidate(0, players = players.filter(player => player !== playerToDelete));
    	}

    	function add_player() {
    		players.push({ name: "", words: [] });
    		$$invalidate(0, players);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	const delete_handler = player => delete_player(player);
    	const player_update_handler = player => update_player();
    	const click_handler = () => add_player();

    	$$self.$capture_state = () => ({
    		Button,
    		Player,
    		players,
    		delete_player,
    		update_player,
    		add_player
    	});

    	$$self.$inject_state = $$props => {
    		if ('players' in $$props) $$invalidate(0, players = $$props.players);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		players,
    		delete_player,
    		add_player,
    		delete_handler,
    		player_update_handler,
    		click_handler
    	];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/common/GithubCorner.svelte generated by Svelte v3.59.2 */

    const file$1 = "src/common/GithubCorner.svelte";

    function create_fragment$1(ctx) {
    	let a;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "class", "background");
    			attr_dev(path0, "d", "M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z");
    			add_location(path0, file$1, 17, 2, 460);
    			attr_dev(path1, "d", "M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2");
    			attr_dev(path1, "fill", "currentColor");
    			set_style(path1, "transform-origin", "130px 106px");
    			attr_dev(path1, "class", "octo-arm svelte-1rr76ng");
    			add_location(path1, file$1, 21, 2, 552);
    			attr_dev(path2, "d", "M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z");
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "class", "octo-body");
    			add_location(path2, file$1, 27, 2, 841);
    			attr_dev(svg, "width", "80");
    			attr_dev(svg, "height", "80");
    			attr_dev(svg, "viewBox", "0 0 250 250");
    			attr_dev(svg, "aria-hidden", "true");
    			set_style(svg, "fill", /*fill*/ ctx[1]);
    			attr_dev(svg, "class", svg_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-1rr76ng"));
    			add_location(svg, file$1, 9, 1, 337);
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			attr_dev(a, "target", "#");
    			attr_dev(a, "class", "github-corner svelte-1rr76ng");
    			attr_dev(a, "aria-label", "View source on GitHub");
    			add_location(a, file$1, 8, 0, 257);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 2) {
    				set_style(svg, "fill", /*fill*/ ctx[1]);
    			}

    			if (dirty & /*classes*/ 4 && svg_class_value !== (svg_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-1rr76ng"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GithubCorner', slots, []);
    	let { href } = $$props;
    	let { position = "topRight" } = $$props;
    	let { fill = "#ff2768" } = $$props;
    	let { small = false } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (href === undefined && !('href' in $$props || $$self.$$.bound[$$self.$$.props['href']])) {
    			console.warn("<GithubCorner> was created without expected prop 'href'");
    		}
    	});

    	const writable_props = ['href', 'position', 'fill', 'small'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GithubCorner> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('position' in $$props) $$invalidate(3, position = $$props.position);
    		if ('fill' in $$props) $$invalidate(1, fill = $$props.fill);
    		if ('small' in $$props) $$invalidate(4, small = $$props.small);
    	};

    	$$self.$capture_state = () => ({ href, position, fill, small, classes });

    	$$self.$inject_state = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('position' in $$props) $$invalidate(3, position = $$props.position);
    		if ('fill' in $$props) $$invalidate(1, fill = $$props.fill);
    		if ('small' in $$props) $$invalidate(4, small = $$props.small);
    		if ('classes' in $$props) $$invalidate(2, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position, small*/ 24) {
    			$$invalidate(2, classes = `${position}${small ? " small" : ""}`);
    		}
    	};

    	return [href, fill, classes, position, small];
    }

    class GithubCorner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { href: 0, position: 3, fill: 1, small: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GithubCorner",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get href() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    const { document: document_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let main;
    	let header;
    	let h6;
    	let a;
    	let t2;
    	let githubcorner;
    	let t3;
    	let content;
    	let current;

    	githubcorner = new GithubCorner({
    			props: {
    				href: "https://github.com/loremdipso/spelling_bee",
    				position: "topRight",
    				small: true
    			},
    			$$inline: true
    		});

    	content = new Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = space();
    			main = element("main");
    			header = element("header");
    			h6 = element("h6");
    			a = element("a");
    			a.textContent = "Spelling Bee";
    			t2 = space();
    			create_component(githubcorner.$$.fragment);
    			t3 = space();
    			create_component(content.$$.fragment);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link0, file, 11, 1, 329);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700");
    			add_location(link1, file, 16, 1, 441);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Roboto+Mono");
    			add_location(link2, file, 21, 1, 569);
    			attr_dev(a, "href", ".");
    			attr_dev(a, "class", "text-white");
    			add_location(a, file, 32, 3, 925);
    			attr_dev(h6, "class", "select-none pl-3 tracking-widest text-lg");
    			add_location(h6, file, 31, 2, 868);
    			attr_dev(header, "class", "relative slide-in-from-top bg-primary-300 dark:bg-black flex flex-wrap h-16 items-center justify-center left-0 p-0 shadow top-0 w-full z-20 svelte-6yy4p9");
    			add_location(header, file, 28, 1, 705);
    			attr_dev(main, "class", "pb-32 fade-in svelte-6yy4p9");
    			add_location(main, file, 27, 0, 675);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link0);
    			append_dev(document_1.head, link1);
    			append_dev(document_1.head, link2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, h6);
    			append_dev(h6, a);
    			append_dev(header, t2);
    			mount_component(githubcorner, header, null);
    			append_dev(main, t3);
    			mount_component(content, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(githubcorner.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(githubcorner.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(githubcorner);
    			destroy_component(content);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	onMount(() => {
    		// force-reset scroll top, since for some reason browsers remember this
    		document.body.scrollTop = 0;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, Content, GithubCorner });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map