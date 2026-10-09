import { Link, router } from 'expo-router';
import { View, TouchableOpacity, TextInput, Touchable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from './Avatar';
import Icon, { IconName } from './Icon';
import ThemedScroller from './ThemeScroller';
import ThemedText from './ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';
import ThemeToggle from '@/components/ThemeToggle';
import { shadowPresets } from '@/utils/useShadow';

const History = [
  { label: 'Home', href: '/' },
  { label: 'Chat with suggestions', href: '/(drawer)/suggestions' },
  { label: 'Lottie animation', href: '/(drawer)/lottie' },
  { label: 'Microphone centered', href: '/(drawer)/mic-animation' },
];

export default function CustomDrawerContent() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  return (
    <View
      className="flex-1 bg-background px-global"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <ThemedScroller className="flex-1 px-0 ">
        <View className="mt-4 flex-row items-center justify-between">
          <View
            className="relative mr-4 flex-1 rounded-full bg-secondary"
            style={shadowPresets.medium}>
            <Icon name="Search" className="absolute left-4 top-4 z-50" size={20} />
            <TextInput
              className="h-[47px] rounded-lg bg-transparent pl-12 pr-3 text-primary"
              placeholder="Search"
              placeholderTextColor={colors.placeholder}
              returnKeyType="done"
              autoFocus={false}
            />
          </View>
          <ThemeToggle />
        </View>

        <View className="mb-4 mt-4 flex-col border-b border-border pb-4">
          <NavItem href="/" icon="Plus" label="New chat" />
          <NavItem href="/screens/search-form" icon="LayoutGrid" label="Explore" />
        </View>

        {History.map((item, index) => (
          <View key={index} className="py-2">
            <Link key={index} href={item.href}>
              <ThemedText className="text-base font-semibold">{item.label}</ThemedText>
            </Link>
          </View>
        ))}
      </ThemedScroller>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/screens/profile')}
        className="flex-row items-center justify-start rounded-3xl border border-border bg-background px-4 pb-4 pt-4">
        <Avatar src={require('@/assets/img/thomino.jpg')} size="md" />
        <View className="ml-4">
          <ThemedText className="text-base font-semibold">Thomino</ThemedText>
          <ThemedText className="text-xs opacity-50">thomino@gmail.com</ThemedText>
        </View>
        <Icon name="ChevronRight" size={18} className="ml-auto" />
      </TouchableOpacity>
    </View>
  );
}

type NavItemProps = {
  href: string;
  icon: IconName;
  label: string;
  className?: string;
  description?: string;
};

export const NavItem = ({ href, icon, label, description }: NavItemProps) => (
  <TouchableOpacity onPress={() => router.push(href)} className="flex-row items-center py-2">
    <View className="h-9 w-9 flex-row items-center justify-center rounded-lg bg-secondary">
      <Icon name={icon} size={18} className="" />
    </View>
    <View className="ml-4 flex-1 ">
      {label && <ThemedText className="text-base font-bold">{label}</ThemedText>}
      {description && <ThemedText className="text-xs opacity-50">{description}</ThemedText>}
    </View>
  </TouchableOpacity>
);
