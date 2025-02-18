import { FeedbackCommon, FeedbackShowOptions, FeedbackHideOptions, FeedbackType, FeedbackPosition } from './common';
import { Application, Color, Utils } from '@nativescript/core';

export { FeedbackType };
export { FeedbackPosition };

export class Feedback extends FeedbackCommon {
  private lastAlert?: com.tapadoo.alerter.Alert = null;

  show(options: FeedbackShowOptions): Promise<void> {
    return new Promise<void>((resolve) => {
      this.lastAlert = null;
      const activityOrDialog = options.dialog ? (options.dialog as any)._dialogFragment?.getDialog() : Application.android.foregroundActivity;
      const alerter = com.tapadoo.alerter.Alerter.create(activityOrDialog)
        .setLayoutGravity(Feedback.getPosition(options.position))
        .setIconColorFilter(0)
        .setDuration(options.duration ? options.duration : 4000);
      if (options.title) {
        alerter.setTitle(options.title);
      }
      if (options.message) {
        alerter.setText(options.message);
      }

      if (options.icon) {
        const resourceId: number = Feedback.getIconResourceId(options.icon);
        if (resourceId === 0) {
          console.log(`icon '${options.icon}' resource not found`);
        } else {
          alerter.setIcon(resourceId);
        }
      } else {
        const resourcename = Feedback.getIconName(options.type);
        if (resourcename !== null) {
          alerter.setIcon(Feedback.getIconResourceId(resourcename));
        } else {
          alerter.showIcon(false);
        }
      }

      if (options.android && options.android.iconPulseEnabled !== undefined) {
        alerter.enableIconPulse(options.android.iconPulseEnabled);
      }

      if (options.titleFont) {
        const assetManger = Utils.ad.getApplicationContext().getAssets();
        const fontPath = `app/fonts/${options.titleFont}`;
        const typeface = android.graphics.Typeface.createFromAsset(assetManger, fontPath);
        alerter.setTitleTypeface(typeface);
      }

      if (options.messageFont) {
        const assetManger = Utils.ad.getApplicationContext().getAssets();
        const fontPath = `app/fonts/${options.messageFont}`;
        const typeface = android.graphics.Typeface.createFromAsset(assetManger, fontPath);
        alerter.setTextTypeface(typeface);
      }

      alerter.setOnClickListener(
        new android.view.View.OnClickListener({
          onClick: () => {
            com.tapadoo.alerter.Alerter.hide();
            if (options.onTap) {
              options.onTap();
            }
          },
        })
      );

      if (options.onShow) {
        alerter.setOnShowListener(
          new com.tapadoo.alerter.OnShowAlertListener({
            onShow: () => options.onShow(),
          })
        );
      }

      if (options.onHide) {
        alerter.setOnHideListener(
          new com.tapadoo.alerter.OnHideAlertListener({
            onHide: () => options.onHide(),
          })
        );
      }

      this.lastAlert = alerter.show();

      if (options.backgroundColor) {
        this.lastAlert.setAlertBackgroundColor(options.backgroundColor.android);
      } else {
        this.lastAlert.setAlertBackgroundColor(Feedback.getBackgroundColor(options.type).android);
      }

      if (options.titleColor) {
        const titleView = this.lastAlert.getTitle(); // android.widget.TextView
        titleView.setTextColor(options.titleColor.android);
      }

      if (options.messageColor) {
        const messageView = this.lastAlert.getText(); // android.widget.TextView
        messageView.setTextColor(options.messageColor.android);
      }

      const titleSize = options.titleSize || 16;
      const messageSize = options.messageSize || 13;

      this.lastAlert.getTitle().setTextSize(titleSize);
      this.lastAlert.getText().setTextSize(messageSize);

      if (options.android && options.android.iconColor) {
        alerter.setIconColorFilter(options.android.iconColor.android);
      }

      resolve();
    });
  }

  private static getBackgroundColor(type?: FeedbackType): Color {
    if (type === undefined || type === null || (type as FeedbackType) === FeedbackType.Custom) {
      return new Color('#73b7e8');
    } else if ((type as FeedbackType) === FeedbackType.Warning) {
      return new Color('#f18b34');
    } else if ((type as FeedbackType) === FeedbackType.Error) {
      return new Color('#ee664c');
    } else if ((type as FeedbackType) === FeedbackType.Info) {
      return new Color('#516a78');
    } else {
      return new Color('#51ae8c');
    }
  }

  private static getIconResourceId(resourcename: string): number {
    const res = Utils.ad.getApplicationContext().getResources();
    return res.getIdentifier(resourcename, 'drawable', Utils.ad.getApplication().getPackageName());
  }

  private static getIconName(type?: FeedbackType): string {
    if (type === undefined || type === null || (type as FeedbackType) === FeedbackType.Custom) {
      return null;
    } else if ((type as FeedbackType) === FeedbackType.Warning) {
      return 'warningicon';
    } else if ((type as FeedbackType) === FeedbackType.Error) {
      return 'erroricon';
    } else if ((type as FeedbackType) === FeedbackType.Info) {
      return 'infoicon';
    } else {
      return 'successicon';
    }
  }

  private static getPosition(position?: FeedbackPosition) {
    if (!position || (position as FeedbackPosition) === FeedbackPosition.Top) {
      return android.view.Gravity.TOP;
    } else {
      return android.view.Gravity.BOTTOM;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hide(options?: FeedbackHideOptions): Promise<void> {
    return new Promise<void>((resolve) => {
      if (com.tapadoo.alerter.Alerter.isShowing()) {
        com.tapadoo.alerter.Alerter.hide();
        this.lastAlert = null;
      }

      resolve();
    });
  }
}
