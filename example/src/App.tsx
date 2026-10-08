import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RHFActionSheetPicker } from 'actionsheet-picker/react-hook-form';
import {
  ActionSheetPicker,
  PickerProvider,
  type ActionSheetPickerHandle,
} from 'actionsheet-picker';
import {
  banks,
  bigList,
  optionGroups,
  countries,
  fetchEmployees,
  type Employee,
} from './data';

function Section({ title, children }: { title: string; children: any }) {
  const dark = useColorScheme() === 'dark';
  return (
    <View style={[styles.section, dark && styles.sectionDark]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Value({ value }: { value: unknown }) {
  return <Text style={styles.value}>value: {JSON.stringify(value)}</Text>;
}

function BasicDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Section title="Basic (key–value, single)">
      <ActionSheetPicker
        label="Country"
        items={countries.slice(0, 6)}
        value={value}
        onChange={setValue}
        testID="basic"
        itemTestID="basic-item"
      />
      <Value value={value} />
    </Section>
  );
}

function SearchDemo() {
  const [value, setValue] = useState<string | null>('KEN5');
  return (
    <Section title="Searchable, preselected (scrolls to selection)">
      <ActionSheetPicker
        label="Country"
        required
        items={countries}
        value={value}
        onChange={setValue}
        searchable
        testID="search"
      />
      <Value value={value} />
    </Section>
  );
}

function SchemaDemo() {
  const [value, setValue] = useState<number | null>(null);
  return (
    <Section title="Raw API objects via schema (+ disabled item)">
      <ActionSheetPicker
        label="Bank"
        items={banks}
        schema={{
          value: 'id',
          label: (b) => `${b.bank_name} (${b.swift})`,
          disabled: 'closed',
        }}
        value={value}
        onChange={setValue}
        testID="schema"
      />
      <Value value={value} />
    </Section>
  );
}

function GroupedDemo() {
  const dark = useColorScheme() === 'dark';
  const [single, setSingle] = useState<number | null>(null);
  const [several, setSeveral] = useState<number[]>([]);
  // Search is opt-in for grouped options, same as for flat lists.
  const [searchable, setSearchable] = useState(true);
  // Default label is just the option ("Banana"); opt in to "Fruits › Banana".
  const [showParent, setShowParent] = useState(false);
  return (
    <Section title="Grouped options (multi-level)">
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, dark && styles.h1Dark]}>
          Searchable
        </Text>
        <Switch
          value={searchable}
          onValueChange={setSearchable}
          testID="grouped-searchable"
          accessibilityLabel="Searchable"
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, dark && styles.h1Dark]}>
          Show group in label
        </Text>
        <Switch
          value={showParent}
          onValueChange={setShowParent}
          testID="grouped-show-parent"
          accessibilityLabel="Show group in label"
        />
      </View>
      <ActionSheetPicker
        label="Single option"
        placeholder="Select an option"
        title="Select an option"
        items={optionGroups}
        hierarchy={{ type: 'nested', childrenKey: 'options' }}
        searchable={searchable}
        showParentLabel={showParent}
        stickyHeaders
        value={single}
        onChange={setSingle}
        testID="grouped"
      />
      <ActionSheetPicker
        label="Several options"
        placeholder="Select options"
        title="Select options"
        multiple
        items={optionGroups}
        hierarchy={{ type: 'nested', childrenKey: 'options' }}
        searchable={searchable}
        showParentLabel={showParent}
        value={several}
        onChange={setSeveral}
        testID="grouped-multi"
      />
      <Value value={{ single, several }} />
    </Section>
  );
}

function MultiDemo() {
  const [labels, setLabels] = useState<string[]>([]);
  const [chips, setChips] = useState<string[]>(['KEN5', 'UGA6']);
  const [limitHit, setLimitHit] = useState(false);
  return (
    <Section title="Multi-select (opt-in)">
      <ActionSheetPicker
        label="Countries (labels, max 3)"
        multiple
        max={3}
        onLimitReached={() => setLimitHit(true)}
        items={countries}
        searchable
        value={labels}
        onChange={(v) => {
          setLimitHit(false);
          setLabels(v);
        }}
        testID="multi"
      />
      {limitHit ? <Text style={styles.hint}>Max 3 reached</Text> : null}
      <ActionSheetPicker
        label="Countries (chips, instant)"
        multiple
        confirmMode="instant"
        multipleDisplay="chips"
        items={countries}
        searchable
        value={chips}
        onChange={setChips}
        testID="chips"
      />
      <Value value={{ labels, chips }} />
    </Section>
  );
}

function RemoteInfiniteDemo() {
  const [value, setValue] = useState<number | null>(null);
  const [term, setTerm] = useState('');
  const [items, setItems] = useState<Employee[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const request = useRef(0);

  useEffect(() => {
    const id = ++request.current;
    setLoading(true);
    fetchEmployees(term, 0).then((res) => {
      if (id !== request.current) return;
      setItems(res.data);
      setPage(0);
      setHasMore(res.hasMore);
      setLoading(false);
    });
  }, [term]);

  const loadMore = useCallback(() => {
    const id = request.current;
    setLoadingMore(true);
    fetchEmployees(term, page + 1).then((res) => {
      if (id !== request.current) return;
      setItems((prev) => [...prev, ...res.data]);
      setPage((p) => p + 1);
      setHasMore(res.hasMore);
      setLoadingMore(false);
    });
  }, [term, page]);

  return (
    <Section title="Remote search + infinite scroll (500 employees)">
      <ActionSheetPicker
        label="Reliever"
        items={items}
        schema={{ value: 'id', label: 'name' }}
        searchable={{
          mode: 'remote',
          onChangeText: setTerm,
          searching: loading && items.length > 0,
        }}
        loading={loading && items.length === 0}
        pagination={{ hasMore, loadingMore, onEndReached: loadMore }}
        value={value}
        onChange={setValue}
        testID="remote"
      />
      <Value value={value} />
    </Section>
  );
}

function StatesDemo() {
  const [value, setValue] = useState<string | null>(null);
  const ref = useRef<ActionSheetPickerHandle>(null);
  return (
    <Section title="Error, disabled, ref">
      <ActionSheetPicker
        ref={ref}
        label="With error"
        items={countries.slice(0, 5)}
        value={value}
        onChange={setValue}
        error={value ? undefined : 'Please pick a country'}
        testID="error"
      />
      <ActionSheetPicker
        label="Disabled"
        items={countries}
        value="KEN5"
        onChange={() => {}}
        disabled
      />
      <Pressable style={styles.button} onPress={() => ref.current?.focus()}>
        <Text style={styles.buttonText}>Open "With error" via ref.focus()</Text>
      </Pressable>
    </Section>
  );
}

function ThemedDemo() {
  const [value, setValue] = useState<number | null>(null);
  const [dark, setDark] = useState<number | null>(null);
  return (
    <Section title="Theming, fullscreen, 2,000 items">
      <PickerProvider
        tokens={{
          colors: { accent: '#2E7D32', selectedBg: 'rgba(46,125,50,0.1)' },
          radii: { input: 4, sheet: 24 },
        }}
        strings={{ placeholder: 'Pick an item…', searchPlaceholder: 'Filter' }}
      >
        <ActionSheetPicker
          label="Provider theme + fullscreen"
          items={bigList}
          searchable
          presentation="fullscreen"
          value={value}
          onChange={setValue}
          testID="big"
        />
      </PickerProvider>
      <ActionSheetPicker
        label="Forced dark"
        colorScheme="dark"
        items={bigList}
        searchable
        value={dark}
        onChange={setDark}
        testID="dark"
      />
    </Section>
  );
}

type FormValues = { country: string | null; groups: number[] };

function FormDemo() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { country: null, groups: [] },
  });
  return (
    <Section title="react-hook-form adapter">
      <RHFActionSheetPicker
        control={control}
        name="country"
        rules={{ required: 'Please select a country' }}
        label="Country"
        items={countries}
        searchable
        testID="form-country"
      />
      <RHFActionSheetPicker
        control={control}
        name="groups"
        rules={{
          validate: (v) => v.length > 0 || 'Select at least one option',
        }}
        label="Options"
        placeholder="Select options"
        multiple
        items={optionGroups}
        hierarchy={{ type: 'nested', childrenKey: 'options' }}
        testID="form-groups"
      />
      <Pressable
        style={styles.button}
        onPress={() => handleSubmit(setSubmitted)()}
        testID="form-submit"
      >
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          reset();
          setSubmitted(null);
        }}
        testID="form-reset"
      >
        <Text style={styles.buttonText}>Reset</Text>
      </Pressable>
      <Value value={{ submitted }} />
    </Section>
  );
}

function InsideModalDemo() {
  const dark = useColorScheme() === 'dark';
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  return (
    <Section title="Picker inside another Modal">
      <Pressable style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>Open host modal</Text>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.hostBackdrop}>
          <View style={[styles.hostCard, dark && styles.sectionDark]}>
            <ActionSheetPicker
              label="Country"
              items={countries}
              searchable
              value={value}
              onChange={setValue}
              testID="nested"
            />
            <Pressable style={styles.button} onPress={() => setOpen(false)}>
              <Text style={styles.buttonText}>Close host modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Section>
  );
}

function Demos() {
  const dark = useColorScheme() === 'dark';
  return (
    <ScrollView
      style={[styles.screen, dark && styles.screenDark]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.h1, dark && styles.h1Dark]}>actionsheet-picker</Text>
      <BasicDemo />
      <SearchDemo />
      <SchemaDemo />
      <GroupedDemo />
      <MultiDemo />
      <RemoteInfiniteDemo />
      <StatesDemo />
      <ThemedDemo />
      <FormDemo />
      <InsideModalDemo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F9' },
  screenDark: { backgroundColor: '#000000' },
  sectionDark: { backgroundColor: '#1C1C1E' },
  h1Dark: { color: '#F2F2F7' },
  content: {
    padding: 16,
    paddingTop: (StatusBar.currentHeight ?? 44) + 16,
    paddingBottom: 64,
  },
  h1: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#1C1C1E' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C6C70',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  value: { fontSize: 12, color: '#6C6C70', fontFamily: 'monospace' },
  hint: { fontSize: 12, color: '#D93025', marginBottom: 8 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: { fontSize: 14, color: '#1C1C1E' },
  button: {
    backgroundColor: '#E5E5EA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#1C1C1E', fontWeight: '600' },
  hostBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  hostCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
});

export default function App() {
  // Optional: with a SafeAreaProvider the picker pads the sheet for the
  // navigation bar / home indicator automatically.
  return (
    <SafeAreaProvider>
      <Demos />
    </SafeAreaProvider>
  );
}
