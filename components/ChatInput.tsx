import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useState, useEffect, useRef } from 'react';
import { Pressable, Image, View, Alert, Text, TouchableOpacity, Keyboard } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  useSharedValue,
  interpolate,
  Easing,
  Extrapolation,
  Keyframe,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedView from './AnimatedView';
import { CardScroller } from './CardScroller';
import Icon from './Icon';
import { ShimmerText } from './ShimmerText';

import useThemeColors from '@/app/contexts/ThemeColors';
import { useRecording } from '@/hooks/useRecording';
import { shadowPresets } from '@/utils/useShadow';

// Exit animation for image removal
const imageExitAnimation = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.8 }] },
}).duration(120);

type ChatInputProps = {
  onSendMessage?: (text: string, images?: string[]) => void;
};

export const ChatInput = (props: ChatInputProps) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecordingUI, setIsRecordingUI] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  const inputRef = useRef<any>(null);

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  // Recording hook
  const { isTranscribing, startRecording, stopRecording, transcribeAudio } = useRecording();

  // Animation shared values
  const rotation = useSharedValue(0);
  const attachExpand = useSharedValue(0);
  const secondaryVisible = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const audioButtonsVisible = useSharedValue(1);
  const stopButtonVisible = useSharedValue(0);
  const inputVisible = useSharedValue(1);
  const lottieVisible = useSharedValue(0);
  const sendButtonVisible = useSharedValue(0);

  // Animation config
  const animConfig = {
    duration: 280,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  // Watch for text input changes to show/hide send button
  useEffect(() => {
    const hasText = inputText.trim().length > 0;
    if (hasText && !isRecordingUI) {
      // Hide audio buttons, show send
      audioButtonsVisible.value = withSpring(0, { damping: 90, stiffness: 600 });
      setTimeout(() => {
        sendButtonVisible.value = withSpring(1, { damping: 90, stiffness: 600 });
      }, 100);
    } else if (!hasText && !isRecordingUI) {
      // Show audio buttons, hide send
      sendButtonVisible.value = withSpring(0, { damping: 90, stiffness: 600 });
      setTimeout(() => {
        audioButtonsVisible.value = withSpring(1, { damping: 90, stiffness: 600 });
      }, 100);
    }
  }, [inputText, isRecordingUI]);

  // Toggle expand/collapse
  const handleToggle = () => {
    if (isExpanded) {
      // Collapse
      rotation.value = withTiming(0, animConfig);
      attachExpand.value = withTiming(0, animConfig);
      containerScale.value = withTiming(1, animConfig);

      // Fade secondary back in after collapse
      setTimeout(() => {
        secondaryVisible.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      }, 280);

      setIsExpanded(false);
    } else {
      // Expand: fade out secondary first, then expand with bounce
      secondaryVisible.value = withTiming(0, { duration: 0, easing: Easing.out(Easing.ease) });

      setTimeout(() => {
        rotation.value = withSpring(135, { damping: 90, stiffness: 600 });
        attachExpand.value = withSpring(1, { damping: 80, stiffness: 600 });
        containerScale.value = withSpring(1, { damping: 90, stiffness: 600 });
        // Settle back to 1
        setTimeout(() => {
          containerScale.value = withSpring(1, { damping: 90, stiffness: 600 });
        }, 150);
      }, 0);

      setIsExpanded(true);
    }
  };

  // Animated styles
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const containerStyle = useAnimatedStyle(() => {
    const width = interpolate(attachExpand.value, [0, 1], [40, 189], Extrapolation.CLAMP);
    return {
      width,
      overflow: 'hidden' as const,
      transform: [{ scale: containerScale.value }],
    };
  });

  const attachButtonStyle = useAnimatedStyle(() => ({
    opacity: attachExpand.value,
    transform: [{ scale: interpolate(attachExpand.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) }],
  }));

  const secondaryButtonStyle = useAnimatedStyle(() => ({
    opacity: secondaryVisible.value,
    transform: [
      { scale: interpolate(secondaryVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
    ],
  }));

  // Audio buttons (Mic + AudioLines) style
  const audioButtonsStyle = useAnimatedStyle(() => ({
    opacity: audioButtonsVisible.value,
    transform: [
      { scale: interpolate(audioButtonsVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
    ],
  }));

  // Stop button style
  const stopButtonStyle = useAnimatedStyle(() => ({
    opacity: stopButtonVisible.value,
    transform: [
      { scale: interpolate(stopButtonVisible.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
    ],
  }));

  // Input fade style
  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputVisible.value,
  }));

  // Lottie fade style
  const lottieStyle = useAnimatedStyle(() => ({
    opacity: lottieVisible.value,
  }));

  // Send button style
  const sendButtonStyle = useAnimatedStyle(() => ({
    opacity: sendButtonVisible.value,
    transform: [
      { scale: interpolate(sendButtonVisible.value, [0, 1], [0.5, 1], Extrapolation.CLAMP) },
    ],
  }));

  const keyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardHeight.value }],
  }));

  // Start recording
  const handleStartRecording = async () => {
    const fadeConfig = { duration: 10, easing: Easing.out(Easing.ease) };

    try {
      await startRecording();

      // Hide Mic + AudioLines, show Stop
      audioButtonsVisible.value = withSpring(0, { damping: 100, stiffness: 600 });
      inputVisible.value = withTiming(0, fadeConfig);
      setTimeout(() => {
        stopButtonVisible.value = withSpring(1, { damping: 100, stiffness: 600 });
        lottieVisible.value = withTiming(1, fadeConfig);
      }, 100);

      setIsRecordingUI(true);
    } catch (error) {
      Alert.alert('Error', 'Could not start recording. Please check microphone permissions.');
    }
  };

  // Stop recording and transcribe
  const handleStopRecording = async () => {
    const fadeConfig = { duration: 10, easing: Easing.out(Easing.ease) };

    // Show Mic + AudioLines, hide Stop
    stopButtonVisible.value = withSpring(0, { damping: 200, stiffness: 600 });
    lottieVisible.value = withTiming(0, fadeConfig);
    setTimeout(() => {
      audioButtonsVisible.value = withSpring(1, { damping: 200, stiffness: 600 });
      inputVisible.value = withTiming(1, fadeConfig);
    }, 100);

    setIsRecordingUI(false);

    try {
      const audioUri = await stopRecording();
      if (audioUri) {
        const transcription = await transcribeAudio(audioUri);
        setInputText((prev) => (prev ? `${prev} ${transcription}` : transcription));
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Transcription failed');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSendMessage = () => {
    if (props.onSendMessage && (inputText.trim() || selectedImages.length > 0)) {
      Keyboard.dismiss();
      props.onSendMessage(inputText, selectedImages.length > 0 ? selectedImages : undefined);
      setInputText('');
      setSelectedImages([]);
    }
  };

  return (
    <>
      <Animated.View
        style={[{ paddingBottom: insets.bottom, zIndex: 999 }, keyboardStyle]}
        className="absolute bottom-0 left-0 right-0 w-full px-global">
        {selectedImages.length > 0 && (
          <View className="mb-0">
            <ScrollableImageList images={selectedImages} onRemove={removeImage} />
          </View>
        )}

        <View
          style={{ ...shadowPresets.card }}
          className="rounded-[25px] border border-border bg-background">
          <LinearGradient
            style={{ borderRadius: 25 }}
            colors={['transparent', 'transparent', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <View className="relative min-h-[60px]">
              {/* Lottie waveform */}
              <Animated.View
                style={[lottieStyle, { position: 'absolute', width: '100%', height: '100%' }]}
                pointerEvents={isRecordingUI ? 'auto' : 'none'}>
                <LottieView
                  ref={lottieRef}
                  autoPlay
                  loop
                  style={{
                    width: '100%',
                    height: 65,
                    position: 'absolute',
                    left: 0,
                    bottom: -12,
                    zIndex: 40,
                  }}
                  source={require('@/assets/lottie/waves.json')}
                />
              </Animated.View>

              {/* Text Input */}
              <Animated.View style={inputStyle} pointerEvents={isRecordingUI ? 'none' : 'auto'}>
                {isTranscribing ? (
                  <View className="px-6 py-5" style={{ minHeight: 60, justifyContent: 'center' }}>
                    <ShimmerText text="Transcribing..." className="text-base text-text" />
                  </View>
                ) : (
                  <TextInput
                    ref={inputRef}
                    placeholder="Ask me anything..."
                    placeholderTextColor={colors.text}
                    className="px-6 py-5 text-text"
                    value={inputText}
                    onChangeText={setInputText}
                    style={{ minHeight: 60 }}
                    multiline
                  />
                )}
              </Animated.View>
            </View>
            <View className="flex-row justify-between rounded-b-3xl px-4 pb-2 pt-4">
              <View className="-ml-2 flex-1 flex-row items-center gap-x-2">
                {/* Expandable container for plus + attachment buttons */}
                <Animated.View
                  style={[containerStyle]}
                  className={`flex-row items-center gap-3 rounded-full border p-1.5 ${isExpanded ? 'border-border bg-background' : ' border-transparent'}`}>
                  <Pressable
                    onPress={handleToggle}
                    className="h-10 w-10 items-center justify-center rounded-full">
                    <Animated.View style={iconStyle}>
                      <Icon name="Plus" size={20} />
                    </Animated.View>
                  </Pressable>

                  {/* Attachment buttons */}
                  <Animated.View style={attachButtonStyle}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={pickImage}
                      className="h-10 w-10 items-center justify-center rounded-full">
                      <Icon name="Image" size={20} />
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View style={attachButtonStyle}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="h-10 w-10 items-center justify-center rounded-full">
                      <Icon name="Camera" size={20} />
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View style={attachButtonStyle}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="h-10 w-10 items-center justify-center rounded-full">
                      <Icon name="File" size={20} />
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>

                {/* Globe and Telescope - fade out when expanded */}
                <Animated.View className="p-1.5" style={secondaryButtonStyle}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-10 w-10 items-center justify-center rounded-full">
                    <Icon name="Globe" size={20} />
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={secondaryButtonStyle}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-10 w-10 items-center justify-center rounded-full">
                    <Icon name="Telescope" size={20} />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View className="flex-row items-center gap-x-2">
                {/* Mic + AudioLines - fade out when recording */}
                <Animated.View style={audioButtonsStyle} className="flex-row gap-x-2">
                  <Pressable
                    onPress={handleStartRecording}
                    className="h-10 w-10 items-center justify-center rounded-full">
                    <Icon name="Mic" size={20} />
                  </Pressable>
                  <Pressable
                    onPress={handleStartRecording}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <Icon name="AudioLines" size={18} color={colors.invert} />
                  </Pressable>
                </Animated.View>

                {/* Stop button - fade in when recording */}
                {isRecordingUI && (
                  <Animated.View style={[stopButtonStyle, { position: 'absolute', right: 0 }]}>
                    <Pressable
                      onPress={handleStopRecording}
                      className="h-10 flex-row items-center justify-center gap-2 rounded-full bg-sky-500 px-4">
                      <Icon name="Check" size={12} color="white" />
                      <Text className="text-sm font-semibold text-white">Done</Text>
                    </Pressable>
                  </Animated.View>
                )}

                {/* Send button - fade in when typing */}
                {!isRecordingUI && (
                  <Animated.View style={[sendButtonStyle, { position: 'absolute', right: 0 }]}>
                    <Pressable
                      onPress={handleSendMessage}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <Icon name="Send" size={18} color={colors.invert} />
                    </Pressable>
                  </Animated.View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </>
  );
};

const ScrollableImageList = ({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) => {
  return (
    <CardScroller className="mb-2 pb-0" space={5}>
      {images.map((uri, index) => (
        <Animated.View key={`${uri}-${index}`} exiting={imageExitAnimation} className="relative">
          <AnimatedView animation="scaleIn" duration={200} delay={200}>
            <Image source={{ uri }} className="h-20 w-20 rounded-2xl" />
            <Pressable
              onPress={() => onRemove(index)}
              className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/50">
              <Icon name="X" size={12} color="white" />
            </Pressable>
          </AnimatedView>
        </Animated.View>
      ))}
    </CardScroller>
  );
};
